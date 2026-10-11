/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { categories, campusLocations } from "@/lib/data";
import { getListingImageUrl } from "@/lib/storage";
import RegisterBusinessUpgrade from "@/components/RegisterBusinessUpgrade";
import {
  Store,
  PlusCircle,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Tag,
  Loader2,
  X,
  UploadCloud,
  MapPin,
} from "lucide-react";

interface ListingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price_ghs: number;
  location: string;
  status: "pending" | "active" | "rejected" | "sold" | "withdrawn";
  created_at: string;
  image_path?: string | null;
}

export default function SellerDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ display_name: string; role: string; business_name: string | null } | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [priceGhs, setPriceGhs] = useState("");
  const [location, setLocation] = useState(campusLocations[0].name);

  // Image upload state (Compulsory)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadSellerData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setLoading(false);
        return;
      }

      setUser(authData.user);

      const [profRes, listRes] = await Promise.all([
        supabase.from("profiles").select("display_name,role,business_name").eq("id", authData.user.id).maybeSingle(),
        supabase.from("listings").select("*").eq("seller_id", authData.user.id).order("created_at", { ascending: false }),
      ]);

      if (profRes.data) {
        setProfile(profRes.data as { display_name: string; role: string; business_name: string | null });
      }
      if (listRes.data) {
        setListings(listRes.data as ListingItem[]);
      }
    } catch (err) {
      console.error("Seller dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadSellerData();
  }, [loadSellerData]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB. Please choose a smaller photo.");
      return;
    }

    setError("");
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function handleRemoveImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleCreateListing(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;

    if (profile?.role !== "seller") {
      setError("Please register your student business details before listing products.");
      return;
    }

    // Compulsory image check
    if (!imageFile) {
      setError("A product photo is required. Please upload a clear photo of your item before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const price = parseFloat(priceGhs);
      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid price in Ghana Cedis (GHS).");
      }

      // Step 1: Create listing record
      const { data: newListing, error: insertError } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          price_ghs: price,
          location,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Step 2: Upload compulsory image
      setUploadingImage(true);
      const fileExt = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${newListing.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload product image: ${uploadError.message}`);
      }

      // Update listing with image_path
      await supabase
        .from("listings")
        .update({ image_path: filePath })
        .eq("id", newListing.id);

      const completeListing: ListingItem = {
        ...newListing,
        image_path: filePath,
      };

      setListings((prev) => [completeListing, ...prev]);
      setSuccess("Your listing was submitted successfully with photo and is awaiting quick approval by campus moderators!");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setPriceGhs("");
      handleRemoveImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  }

  async function updateListingStatus(id: string, newStatus: "sold" | "withdrawn" | "active") {
    if (!supabase) return;
    try {
      const { error: updErr } = await supabase.from("listings").update({ status: newStatus }).eq("id", id);
      if (updErr) throw updErr;

      setListings((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item status.");
    }
  }

  async function handleDeleteListing(id: string) {
    if (!supabase || !confirm("Are you sure you want to delete this listing?")) return;
    try {
      const { error: delErr } = await supabase.from("listings").delete().eq("id", id);
      if (delErr) throw delErr;

      setListings((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Listing deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item.");
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-xs font-semibold text-gray-500">Loading Seller Portal...</p>
      </div>
    );
  }

  // Case 1: Not logged in
  if (!user) {
    return (
      <div className="w-full max-w-md rounded-3xl glass-card p-8 text-center shadow-lg">
        <Store className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Sign in to Seller Dashboard</h2>
        <p className="mt-2 text-xs text-gray-500">You must be logged into a seller account to manage products.</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/register-business"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Register Student Business
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Logged in as customer -> Must register student business first
  if (profile?.role !== "seller") {
    return (
      <div className="flex w-full justify-center px-2">
        <RegisterBusinessUpgrade
          initialDisplayName={profile?.display_name}
          onSuccess={() => {
            setLoading(true);
            void loadSellerData();
          }}
        />
      </div>
    );
  }

  // Case 3: Registered Seller
  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  return (
    <div className="w-full max-w-5xl space-y-6 px-1 sm:px-0">
      {/* Top Banner (Frosted Glass) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl glass-card p-6 shadow-sm">
        <div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800">
            Student Seller Portal
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {profile?.business_name || profile?.display_name || "Campus Business Hub"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage your items, check review status, and reach students across UHAS Ho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-xs font-bold text-green-700 border border-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards (Mobile responsive grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="rounded-3xl glass-card p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Package className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{activeCount}</p>
          <p className="text-xs font-semibold text-gray-500">Live Active Items</p>
        </div>

        <div className="rounded-3xl glass-card p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{pendingCount}</p>
          <p className="text-xs font-semibold text-gray-500">Pending Review</p>
        </div>

        <div className="rounded-3xl glass-card p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Tag className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{soldCount}</p>
          <p className="text-xs font-semibold text-gray-500">Marked as Sold</p>
        </div>
      </div>

      {/* Product Catalog Section */}
      <div className="overflow-hidden rounded-3xl glass-card shadow-sm">
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">Your Product Catalog</h2>
          <p className="text-xs text-gray-500">Products are reviewed by campus moderators before going live to students.</p>
        </div>

        {listings.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-900">No products listed yet</p>
            <p className="mt-1 text-xs text-gray-500">Start selling your items by uploading your first product photo.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Touch-friendly Card List (Hidden on desktop) */}
            <div className="divide-y divide-gray-100 block md:hidden">
              {listings.map((item) => {
                const itemImg = getListingImageUrl(item.image_path);
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-slate-100 shadow-sm">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </span>
                          {item.status === "active" && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                              Active
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              Pending
                            </span>
                          )}
                          {item.status === "sold" && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                              Sold
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              Rejected
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1 text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                        <p className="text-xs font-extrabold text-blue-600">
                          GHS {Number(item.price_ghs).toFixed(2)}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1 truncate">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                      {item.status === "active" && (
                        <button
                          type="button"
                          onClick={() => updateListingStatus(item.id, "sold")}
                          className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-center"
                        >
                          Mark Sold
                        </button>
                      )}
                      {item.status === "sold" && (
                        <button
                          type="button"
                          onClick={() => updateListingStatus(item.id, "active")}
                          className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-center"
                        >
                          Relist Item
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        className="rounded-xl border border-red-200 bg-red-50/50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Data Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/70 text-gray-600">
                  <tr>
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map((item) => {
                    const itemImg = getListingImageUrl(item.image_path);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-slate-100 shadow-sm">
                              {itemImg ? (
                                <img
                                  src={itemImg}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{item.title}</p>
                              <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize text-gray-600">{item.category}</td>
                        <td className="p-4 font-bold text-blue-600">GHS {Number(item.price_ghs).toFixed(2)}</td>
                        <td className="p-4 text-gray-600">{item.location}</td>
                        <td className="p-4">
                          {item.status === "active" && (
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                              Active
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                              Pending Review
                            </span>
                          )}
                          {item.status === "sold" && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                              Sold
                            </span>
                          )}
                          {item.status === "withdrawn" && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                              Withdrawn
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "active" && (
                              <button
                                type="button"
                                onClick={() => updateListingStatus(item.id, "sold")}
                                className="rounded-xl border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                Mark Sold
                              </button>
                            )}
                            {item.status === "sold" && (
                              <button
                                type="button"
                                onClick={() => updateListingStatus(item.id, "active")}
                                className="rounded-xl border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                Relist
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.id)}
                              className="rounded-xl p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add New Product Modal (iPhone Frosted Glass Modal) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl glass-modal p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">List New Product on Campus</h3>
                <p className="text-xs text-gray-500">Post items to students across Sokode, Trafalgar &amp; Dave campuses.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  handleRemoveImage();
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Product / Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. White Nike Air Force (Size 42)"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Photo Upload Area (COMPULSORY) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Product Photo <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Required
                  </span>
                </div>

                {imagePreview ? (
                  <div className="relative mt-1 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/40 p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-gray-800">{imageFile?.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {imageFile ? (imageFile.size / 1024 / 1024).toFixed(2) : 0} MB &bull; Photo ready
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
                      error && !imageFile
                        ? "border-red-400 bg-red-50/40"
                        : "border-gray-200 bg-white/70 hover:border-blue-400 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-gray-900">
                      Tap to upload product photo
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">JPG, PNG, or WEBP up to 5MB</span>
                    <span className="mt-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Every listing must have a photo
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Price (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={priceGhs}
                    onChange={(e) => setPriceGhs(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Pickup / Service Location in Ho <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                >
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe condition, size, ingredients, or meetup instructions (min 10 characters)..."
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 p-3 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    handleRemoveImage();
                  }}
                  className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 active:scale-95"
                >
                  {submitting
                    ? uploadingImage
                      ? "Uploading photo..."
                      : "Submitting..."
                    : "Submit Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
