/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import {
  ArrowRight,
  Store,
  ShieldCheck,
  MessageSquare,
  MapPin,
  Sparkles,
  Phone,
  X,
  Package,
} from "lucide-react";
import { getListingImageUrl } from "@/lib/storage";
import { categories, getCategoryIcon } from "@/lib/data";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export default function FeaturedListings() {
  const supabase = createClient();
  const [listings, setListings] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [sheetImgError, setSheetImgError] = useState(false);

  useEffect(() => {
    async function loadRecent() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id,title,description,category,price_ghs,location,seller_id,image_path,created_at,profiles(display_name,business_name,phone_number,campus_location)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4);

        if (!error && data) {
          setListings(data as unknown as ProductItem[]);
        }
      } catch (err) {
        console.error("Failed to load featured items:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadRecent();
  }, [supabase]);

  // Modal details
  const modalSellerName =
    selectedProduct?.profiles?.business_name || selectedProduct?.profiles?.display_name || "Campus Vendor";
  const modalSellerPhone = selectedProduct?.profiles?.phone_number;
  const modalImageUrl = selectedProduct ? getListingImageUrl(selectedProduct.image_path) : null;
  const ModalCategoryIcon = selectedProduct ? getCategoryIcon(selectedProduct.category) : Package;
  const modalCategoryObj = selectedProduct ? categories.find((c) => c.id === selectedProduct.category) : null;

  const modalWhatsAppUrl = selectedProduct
    ? createWhatsAppUrl(
        modalSellerPhone,
        `Hello ${modalSellerName}, I saw your listing "${selectedProduct.title}" (GHS ${Number(
          selectedProduct.price_ghs
        ).toFixed(2)}) on UHASMART. Is it still available?`
      )
    : null;

  return (
    <section className="bg-white py-10 sm:py-16 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Live Ho Marketplace</span>
            <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
              Recent Listings in Ho
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Verified items, hostels, and services posted across Sokode, Dave, Trafalgar, Bankoe, Dome &amp; Central Ho.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:underline"
          >
            <span>Browse all items</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onInquire={(p) => {
                  setSelectedProduct(p);
                  setSheetImgError(false);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-slate-50/70 p-6 sm:p-12 text-center">
            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
              <Store className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">Be the first to list on UHASMART</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-500">
              Have textbooks, gadgets, thrift fashion, food, or student services to offer? Post your item in 60 seconds and start receiving direct inquiries on WhatsApp!
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Start Selling</span>
              </Link>
              <Link
                href="/register-business"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <span>Register Student Brand</span>
              </Link>
            </div>
          </div>
        )}

        {/* Value props grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-xs sm:text-sm font-bold text-gray-900">Verified Students</h4>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
              Transactions are between verified students attending UHAS Ho campuses.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-xs sm:text-sm font-bold text-gray-900">Direct WhatsApp</h4>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
              Chat directly with sellers without middlemen or transaction charges.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <MapPin className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-xs sm:text-sm font-bold text-gray-900">Campus Meetups</h4>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
              Fast, safe pickups at Sokode, Trafalgar, or Dave campus hostels.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-xs sm:text-sm font-bold text-gray-900">100% Free to List</h4>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
              Zero commission and zero listing fees. Keep all your earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Product Details Bottom Sheet */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Pull Handle */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ModalCategoryIcon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {modalCategoryObj?.name ?? selectedProduct.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Product Photo Showcase */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                {modalImageUrl && !sheetImgError ? (
                  <img
                    src={modalImageUrl}
                    alt={selectedProduct.title}
                    onError={() => setSheetImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-gray-400">
                    <ModalCategoryIcon className="h-12 w-12 text-gray-300" />
                    <span className="mt-2 text-xs font-semibold text-gray-400">
                      {modalCategoryObj?.name ?? "Campus Item"}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3">
                  <div className="glass-pill inline-flex items-baseline gap-1 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md">
                    <span className="text-xs font-bold text-blue-600">GHS</span>
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                      {Number(selectedProduct.price_ghs).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                  {selectedProduct.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>{selectedProduct.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Student Verified</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Item Description
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description || "No additional description provided by the seller."}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-base shadow-sm">
                    {modalSellerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <p className="font-bold text-sm text-gray-900 truncate">{modalSellerName}</p>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {selectedProduct.profiles?.campus_location || selectedProduct.location} &bull; Campus Vendor
                    </p>
                  </div>
                </div>
              </div>

              {modalWhatsAppUrl ? (
                <div className="space-y-2">
                  <a
                    href={modalWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-98 transition-all"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Chat Directly on WhatsApp</span>
                  </a>
                </div>
              ) : null}

              <Link
                href="/marketplace"
                className="block text-center rounded-xl border border-gray-200 bg-slate-50 py-2.5 text-xs font-bold text-gray-700 hover:bg-slate-100"
              >
                View Full Marketplace &amp; Message in App
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
