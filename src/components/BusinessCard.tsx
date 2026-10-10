import Link from "next/link";
import { Star, MapPin, Package } from "lucide-react";
import { SampleBusiness, categories } from "@/lib/data";

interface BusinessCardProps {
  business: SampleBusiness;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const categoryObj = categories.find((c) => c.id === business.category);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {categoryObj?.emoji} {categoryObj?.name ?? business.category}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {business.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-gray-900">{business.name}</h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{business.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1 truncate max-w-[140px]">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          {business.location}
        </span>
        <span className="flex items-center gap-1 font-semibold text-blue-600">
          <Package className="h-3.5 w-3.5" />
          {business.productsCount} items
        </span>
      </div>
    </div>
  );
}
