/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { MapPin, Phone, MessageSquare, Store } from "lucide-react";
import { categories, getCategoryIcon } from "@/lib/data";
import { getListingImageUrl } from "@/lib/storage";

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
  const sellerName = product.profiles?.business_name || product.profiles?.display_name || "Student Seller";
  const sellerPhone = product.profiles?.phone_number;
  const imageUrl = getListingImageUrl(product.image_path);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div>
        {/* Product Photo or Category Fallback */}
        <div className="relative mb-3.5 h-48 w-full overflow-hidden rounded-xl bg-slate-100">
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
              <CategoryIcon className="h-10 w-10 text-gray-300" />
              <span className="mt-1 text-[11px] font-semibold text-gray-400">
                {categoryObj?.name ?? "Campus Item"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <CategoryIcon className="h-3.5 w-3.5 text-blue-600" />
            <span>{categoryObj?.name ?? product.category}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-[120px]">{product.location}</span>
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1">
          {product.title}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-xs font-semibold text-blue-600">GHS</span>
          <span className="text-xl font-extrabold text-gray-900">
            {Number(product.price_ghs).toFixed(2)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
          <Store className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-semibold text-gray-800 truncate">{sellerName}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-gray-50 pt-4">
        {sellerPhone ? (
          <a
            href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hi, I saw your listing "${product.title}" on UHASMART. Is it still available?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100"
          >
            <Phone className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        ) : null}

        <button
          type="button"
          onClick={() => onInquire?.(product)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Inquire
        </button>
      </div>
    </div>
  );
}
