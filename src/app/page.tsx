import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import BusinessCard from "@/components/BusinessCard";
import { categories, sampleBusinesses } from "@/lib/data";
import {
  ArrowRight,
  ShoppingBag,
  Store,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
          <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Official Student Marketplace &bull; UHAS Ho Campus</span>
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Your Campus. <span className="text-blue-600">Your Marketplace.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              Buy and sell products, thrift wears, gadgets, campus food, and academic services directly with verified students across Sokode, Dave, and Trafalgar campuses.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Browse Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register-business"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-800 shadow-sm hover:border-gray-400 hover:bg-gray-50"
              >
                <Store className="h-4 w-4 text-purple-600" />
                <span>Sell on UHASMART</span>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 border-t border-gray-100 pt-8">
              <div>
                <p className="text-2xl font-black text-gray-900 sm:text-3xl">GHS 0</p>
                <p className="text-xs font-semibold text-gray-500">Free to List</p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600 sm:text-3xl">3</p>
                <p className="text-xs font-semibold text-gray-500">UHAS Ho Campuses</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 sm:text-3xl">100%</p>
                <p className="text-xs font-semibold text-gray-500">Student Verified</p>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Explore Categories</span>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Popular Campus Categories
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
              >
                <span>View all products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED STUDENT BUSINESSES */}
        <section className="bg-white py-16 border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Student Entrepreneurs</span>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Featured Campus Brands
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-xs text-gray-500">
                Support fellow UHAS students running food, fashion, and tech services right on your campus.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {sampleBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Simple &amp; Safe</span>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                How UHASMART Works
              </h2>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-3 text-center">
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">
                  1
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">Create an Account</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Join with your student email as a Customer or register your student business in under 60 seconds.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-purple-50 text-xl font-black text-purple-600">
                  2
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">Browse or List Items</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Find deals by category and campus location, or post your items with price in Ghana Cedis.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 text-xl font-black text-emerald-600">
                  3
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">Connect &amp; Exchange</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Chat via WhatsApp or in-app messaging, meet safely on campus, and complete your trade!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
