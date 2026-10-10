"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, UserRound, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/messages", label: "Messages" },
  { href: "/seller", label: "Sell on UHASMART" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;

    async function checkUser() {
      try {
        if (!supabase) return;
        const { data } = await supabase.auth.getUser();
        const signedIn = Boolean(data?.user);
        setIsLoggedIn(signedIn);
        if (signedIn) {
          const { data: adminRes } = await supabase.rpc("is_admin");
          setIsAdmin(Boolean(adminRes));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    }

    void checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: unknown, session: { user: unknown } | null) => {
      try {
        const signedIn = Boolean(session?.user);
        setIsLoggedIn(signedIn);
        if (signedIn && supabase) {
          const { data: adminRes } = await supabase.rpc("is_admin");
          setIsAdmin(Boolean(adminRes));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2" aria-label="UHASMART home">
          <span className="rounded-xl bg-blue-600 p-1.5 shadow-sm transition-colors group-hover:bg-blue-700">
            <ShoppingBag className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-blue-700">UHASMART</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-blue-50 font-bold text-blue-700"
                  : "text-gray-600 hover:bg-white/70 hover:text-blue-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              aria-current={pathname === "/admin" ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                pathname === "/admin"
                  ? "bg-purple-100 font-bold text-purple-800"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100/80"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link
            href="/login"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              isLoggedIn
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100/70"
                : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            <UserRound className="h-4 w-4" />
            {isLoggedIn ? "My Account" : "Sign In"}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass-panel space-y-1 rounded-2xl border border-white/70 p-3 shadow-xl md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                pathname === link.href
                  ? "bg-blue-50 font-bold text-blue-700"
                  : "text-gray-700 hover:bg-white/70 hover:text-blue-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              aria-current={pathname === "/admin" ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold ${
                pathname === "/admin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Hub
            </Link>
          )}
          <Link
            href="/login"
            aria-current={pathname === "/login" ? "page" : undefined}
            onClick={() => setMobileOpen(false)}
            className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
              pathname === "/login"
                ? "bg-blue-50 font-bold text-blue-700"
                : "text-blue-700 hover:bg-white/70"
            }`}
          >
            {isLoggedIn ? "My Account" : "Sign In"}
          </Link>
        </div>
      )}
    </nav>
  );
}
