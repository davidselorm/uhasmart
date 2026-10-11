import Link from "next/link";
import { Category } from "@/lib/data";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-gray-100/90 bg-white p-3.5 sm:p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md active:scale-95"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </div>

        <h3 className="mt-3 text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {category.name}
        </h3>

        <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-blue-600 group-hover:underline">
          Explore items
        </span>
      </div>
    </Link>
  );
}
