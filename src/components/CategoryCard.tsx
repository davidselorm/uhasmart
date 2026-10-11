import Link from "next/link";
import { Category } from "@/lib/data";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-gray-900 group-hover:text-blue-600">
        {category.name}
      </h3>
      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
        {category.description}
      </p>
    </Link>
  );
}
