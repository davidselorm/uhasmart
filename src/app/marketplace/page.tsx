"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import { categories, campusLocations } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  MapPin,
  Package,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function MarketplacePage() {
  const supabase = createClient();
  const [listings, setListings] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");

  // Inquiry Modal
  const [inquireProduct, setInquireProduct] = useState<ProductItem | null>(null);
  const [inquiryBody, setInquiryBody] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryNotice, setInquiryNotice] = useState("");
  const [inquiryError, setInquiryError] = useState("");

  useEffect(() => {
    async function loadMarketplace() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id,title,description,category,price_ghs,location,seller_id,image_path,created_at,profiles(display_name,business_name,phone_number,campus_location)")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setListings(data as unknown as ProductItem[]);
        }
      } catch (err) {
        console.error("Error loading listings:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadMarketplace();
  }, [supabase]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return listings
      .filter((item) => {
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.profiles?.business_name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesLocation && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return Number(a.price_ghs) - Number(b.price_ghs);
        if (sortBy === "price-high") return Number(b.price_ghs) - Number(a.price_ghs);
        return 0;
      });
  }, [listings, selectedCategory, selectedLocation, searchQuery, sortBy]);

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !inquireProduct) return;

    setSendingInquiry(true);
    setInquiryNotice("");
    setInquiryError("");

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error("You must sign in to message sellers directly. Please click Sign In in the menu.");
      }

      if (authData.user.id === inquireProduct.seller_id) {
        throw new Error("You cannot send an inquiry on your own product.");
      }

      // Create inquiry or find existing
      const { data: inqData, error: inqErr } = await supabase
        .from("inquiries")
        .upsert({
          listing_id: inquireProduct.id,
          buyer_id: authData.user.id,
          seller_id: inquireProduct.seller_id,
        })
        .select()
        .single();

      if (inqErr) throw inqErr;

      // Add message
      const { error: msgErr } = await supabase.from("inquiry_messages").insert({
        inquiry_id: inqData.id,
        sender_id: authData.user.id,
        body: inquiryBody.trim(),
      });

      if (msgErr) throw msgErr;

      setInquiryNotice("Inquiry sent to the seller! You can continue the chat in the Messages tab.");
      setInquiryBody("");
      setTimeout(() => {
        setInquireProduct(null);
        setInquiryNotice("");
      }, 2500);
    } catch (err) {
      setInquiryError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSendingInquiry(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">UHAS Ho Campus</span>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">Campus Marketplace</h1>
            <p className="mt-1 text-xs text-gray-500">
              Browse deals posted by students across Sokode, Dave, and Trafalgar hostels.
            </p>
          </div>

          {/* Search & Filter Bar (iPhone Frosted Glass) */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-3xl glass-card p-3 sm:p-3.5 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, shoes, food, books..."
                className="w-full rounded-2xl border border-gray-200/80 bg-white/70 py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-auto rounded-2xl border border-gray-200/80 bg-white/70 py-2.5 pl-8 pr-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="all">All Campuses</option>
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 sm:flex-initial rounded-2xl border border-gray-200/80 bg-white/70 px-3 py-2.5 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs (Horizontal Swipe on Mobile with Glass Pills) */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "glass-pill text-gray-700 hover:bg-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                    selectedCategory === c.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "glass-pill text-gray-700 hover:bg-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-3 text-xs font-semibold text-gray-500">Loading campus marketplace items...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-base font-bold text-gray-900">No active products found</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Try adjusting your search query, or be the first student seller to list an item in this category!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onInquire={(item) => setInquireProduct(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Inquiry Modal (iPhone Frosted Glass Bottom Sheet on Mobile) */}
      {inquireProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-t-[2rem] sm:rounded-3xl glass-modal p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 truncate max-w-[280px]">
                  Message Seller: {inquireProduct.title}
                </h3>
                <p className="text-xs font-bold text-blue-600">GHS {Number(inquireProduct.price_ghs).toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={() => setInquireProduct(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="mt-4 space-y-3">
              {inquiryNotice && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{inquiryNotice}</span>
                </div>
              )}
              {inquiryError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{inquiryError}</span>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Your message to {inquireProduct.profiles?.display_name || "the seller"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={inquiryBody}
                  onChange={(e) => setInquiryBody(e.target.value)}
                  placeholder="Hi, is this still available? Where on campus can we meet?"
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInquireProduct(null)}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingInquiry ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
