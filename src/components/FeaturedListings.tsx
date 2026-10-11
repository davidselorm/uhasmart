"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import { ArrowRight, Store, ShieldCheck, MessageSquare, MapPin, Sparkles } from "lucide-react";

export default function FeaturedListings() {
  const supabase = createClient();
  const [listings, setListings] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          .limit(3);

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

  return (
    <section className="bg-white py-16 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Live Campus Market</span>
            <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Recent Campus Listings
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Verified items posted by UHAS students across Sokode, Dave, and Trafalgar.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
          >
            <span>Browse all items</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-slate-50/70 p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
              <Store className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">Be the first to list on UHASMART</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-500">
              Have textbooks, gadgets, thrift fashion, food, or student services to offer? Post your item in 60 seconds and start receiving direct inquiries on WhatsApp!
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Verified Students</h4>
            <p className="mt-1 text-xs text-gray-500">
              Transactions are between verified students attending UHAS Ho campuses.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Direct WhatsApp</h4>
            <p className="mt-1 text-xs text-gray-500">
              Chat directly with sellers without middlemen or transaction charges.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <MapPin className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Campus Meetups</h4>
            <p className="mt-1 text-xs text-gray-500">
              Fast, safe pickups at Sokode, Trafalgar, or Dave campus hostels.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">100% Free to List</h4>
            <p className="mt-1 text-xs text-gray-500">
              Zero commission and zero listing fees. Keep all your earnings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
