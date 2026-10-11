/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { MapPin, Phone, MessageSquare, Store } from "lucide-react";
import { categories, getCategoryIcon } from "@/lib/data";
import { getListingImageUrl } from "@/lib/storage";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price_ghs: number;
  location: string;
  seller_id?: string;
  image_path?: string | null;
  profiles?: {
    display_name: string;
    business_name?: string | null;
    phone_number?: string | null;
    campus_location?: string | null;
  } | null;
}

interface ProductCardProps {
  product: ProductItem;
  onInquire?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onInquire }: ProductCardProps) {
  const categoryObj = categories.find((c) => c.id === product.category);
  const CategoryIcon = getCategoryIcon(product.category);
  const sellerName = product.profiles?.business_name || product.profiles?.display_name || "Vendor";
  const sellerPhone = product.profiles?.phone_number;
  const imageUrl = getListingImageUrl(product.image_path);
  const [imageError, setImageError] = useState(false);

  const whatsAppUrl = createWhatsAppUrl(
    sellerPhone,
    `Hello ${sellerName}, I saw your listing "${product.title}" (GHS ${Number(product.price_ghs).toFixed(
      2
    )}) on UHASMART. Is it still available?`
  );

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100/90 bg-white p-2.5 sm:p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md active:scale-[0.99]">
      {/* Clickable Card Body */}
      <div
        onClick={() => onInquire?.(product)}
        className="cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onInquire?.(product);
          }
        }}
      >
        {/* Product Photo with Floating Badges */}
        <div className="relative mb-2.5 sm:mb-3 aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.title}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-gray-400">
              <CategoryIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
              <span className="mt-1 text-[10px] sm:text-[11px] font-semibold text-gray-400">
                {categoryObj?.name ?? "Item"}
              </span>
            </div>
          )}

          {/* Floating Category Pill */}
          <div className="absolute top-2 left-2 z-10">
            <span className="glass-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm backdrop-blur-md">
              <CategoryIcon className="h-3 w-3 text-blue-600 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[110px]">
                {categoryObj?.name ?? product.category}
              </span>
            </span>
          </div>

          {/* Floating WhatsApp indicator if seller has WhatsApp */}
          {whatsAppUrl && (
            <div className="absolute top-2 right-2 z-10">
              <span
                title="Direct WhatsApp Available"
                className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-white/80"
              >
                <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </span>
            </div>
          )}
        </div>

        {/* Price & Location */}
        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-blue-600">GHS</span>
            <span className="text-sm sm:text-lg font-black text-gray-900 tracking-tight">
              {Number(product.price_ghs).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-1 text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Location & Seller Info */}
        <div className="mt-1 flex items-center justify-between gap-1 text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{product.location}</span>
          </span>
          <span className="flex items-center gap-1 truncate max-w-[45%] font-medium text-gray-600">
            <Store className="h-3 w-3 text-blue-500 shrink-0" />
            <span className="truncate">{sellerName}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3 flex items-center gap-1.5 sm:gap-2 border-t border-gray-100 pt-2.5 sm:pt-3">
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl sm:rounded-2xl bg-emerald-600 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInquire?.(product);
          }}
          className={`${
            whatsAppUrl ? "flex-1" : "w-full"
          } inline-flex items-center justify-center gap-1 rounded-xl sm:rounded-2xl bg-blue-600 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all`}
        >
          <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="truncate">Inquire</span>
        </button>
      </div>
    </div>
  );
}
