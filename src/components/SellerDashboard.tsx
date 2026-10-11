"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { categories, campusLocations } from "@/lib/data";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [priceGhs, setPriceGhs] = useState("");
  const [location, setLocation] = useState(campusLocations[0].name);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function loadSellerData() {
      try {
        if (!supabase) return;
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
    }

    void loadSellerData();
  }, [supabase]);

  async function handleCreateListing(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const price = parseFloat(priceGhs);
      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid price in Ghana Cedis (GHS).");
      }

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

      setListings((prev) => [newListing as ListingItem, ...prev]);
      setSuccess("Your listing was submitted successfully and is awaiting quick approval by campus moderators!");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setPriceGhs("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setSubmitting(false);
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
        <p className="mt-4 text-sm font-medium text-gray-500">Loading Seller Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Store className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Sign in to Seller Dashboard</h2>
        <p className="mt-2 text-xs text-gray-500">You must be logged into a seller account to manage products.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            Student Seller Portal
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {profile?.business_name || profile?.display_name || "Campus Business Hub"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage your items, check review status, and reach fellow UHAS students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Package className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{activeCount}</p>
          <p className="text-xs font-semibold text-gray-500">Live Active Items</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{pendingCount}</p>
          <p className="text-xs font-semibold text-gray-500">Pending Review</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Tag className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900">{soldCount}</p>
          <p className="text-xs font-semibold text-gray-500">Marked as Sold</p>
        </div>
      </div>

      {/* Listings Table */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Your Inventory ({listings.length})</h2>
        <p className="text-xs text-gray-500">All products and services listed under your seller profile.</p>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-sm font-bold text-gray-800">No items listed yet</h3>
            <p className="mt-1 text-xs text-gray-500">Click &ldquo;Add New Product&rdquo; above to list your first item.</p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-gray-100">
            {listings.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        item.status === "active"
                          ? "bg-green-100 text-green-800"
                          : item.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "sold"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {categories.find((c) => c.id === item.category)?.name ?? item.category}
                    </span>
                  </div>
                  <h3 className="mt-1.5 truncate text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs font-extrabold text-blue-600">GHS {Number(item.price_ghs).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "active" && (
                    <button
                      type="button"
                      onClick={() => void updateListingStatus(item.id, "sold")}
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Mark Sold
                    </button>
                  )}
                  {item.status === "sold" && (
                    <button
                      type="button"
                      onClick={() => void updateListingStatus(item.id, "active")}
                      className="rounded-xl border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDeleteListing(item.id)}
                    className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-extrabold text-gray-900">Add Campus Product / Service</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                  placeholder="e.g. Nike Air Max size 42 (brand new)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Campus Location / Hostel <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
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
                  placeholder="Describe the condition, specifications, or details..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
