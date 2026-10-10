import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-blue-600 p-1.5 shadow-sm">
              <ShoppingBag className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-blue-700">UHASMART</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/marketplace" className="hover:text-blue-600">Marketplace</Link>
            <Link href="/register-business" className="hover:text-blue-600">Register Business</Link>
            <Link href="/login" className="hover:text-blue-600">My Account</Link>
          </div>

          <p className="flex items-center gap-1 text-xs text-gray-400">
            Built for UHAS students with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> in Ho, Ghana
          </p>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} UHASMART. University of Health and Allied Sciences student marketplace.
        </div>
      </div>
    </footer>
  );
}
