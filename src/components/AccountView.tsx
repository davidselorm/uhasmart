"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";
import AccountHub from "@/components/AccountHub";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface AccountViewProps {
  mode: "login" | "register";
  defaultRole?: "customer" | "seller";
}

export default function AccountView({ mode, defaultRole = "customer" }: AccountViewProps) {
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    let isMounted = true;

    // Safety timeout: never hang longer than 2 seconds
    const timeout = setTimeout(() => {
      if (isMounted) setChecking(false);
    }, 2000);

    async function checkAuth() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.auth.getUser();
        if (isMounted) {
          if (error || !data?.user) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        }
      } catch {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    void checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: unknown, session: { user: unknown } | null) => {
      if (isMounted) {
        setIsAuthenticated(Boolean(session?.user));
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (checking) {
    return (
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-gray-500">Checking account status...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AccountHub />;
  }

  return <AuthForm mode={mode} defaultRole={defaultRole} />;
}
