"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Mail,
  LogOut,
  Store,
  MessageSquare,
  ArrowRight,
  Loader2,
  User,
  KeyRound,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface ProfileData {
  display_name: string;
  role?: "customer" | "seller";
  business_name?: string | null;
  phone_number?: string | null;
  campus_location?: string | null;
}

export default function AccountHub() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listingCount, setListingCount] = useState<number>(0);
  const [signingOut, setSigningOut] = useState(false);

  // Settings & editing states
  const [activeTab, setActiveTab] = useState<"overview" | "edit-profile" | "security">("overview");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function loadAccount() {
      try {
        if (!supabase) return;
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData?.user) {
          setUser(null);
          return;
        }

        setUser(authData.user);

        // Fetch user profile and admin status concurrently
        const [profileRes, adminRes, countRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name,role,business_name,phone_number,campus_location")
            .eq("id", authData.user.id)
            .maybeSingle(),
          supabase.rpc("is_admin"),
          supabase.from("listings").select("id", { count: "exact", head: true }).eq("seller_id", authData.user.id),
        ]);

        if (profileRes.data) {
          const p = profileRes.data as ProfileData;
          setProfile(p);
          setEditDisplayName(p.display_name || "");
          setEditBusinessName(p.business_name || "");
          setEditPhone(p.phone_number || "");
          setEditLocation(p.campus_location || "");
        } else {
          const defaultName = authData.user.email?.split("@")[0] || "Student";
          setProfile({
            display_name: defaultName,
            role: "customer",
          });
          setEditDisplayName(defaultName);
        }

        if (adminRes.data) setIsAdmin(Boolean(adminRes.data));
        if (countRes.count !== null && countRes.count !== undefined) setListingCount(countRes.count);
      } catch (err) {
        console.error("Account load error:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;

    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const updates: Partial<ProfileData> = {
        display_name: editDisplayName.trim(),
        campus_location: editLocation.trim() || null,
      };

      if (profile?.role === "seller") {
        updates.business_name = editBusinessName.trim() || null;
        updates.phone_number = editPhone.trim() || null;
      }

      const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setProfileSuccess("Your profile details were updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !user?.email) return;

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error("Current password is incorrect. Please check and try again.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordSuccess("Your password was updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!supabase) return;
    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }

    setDeletingAccount(true);
    setDeleteError("");

    try {
      const { error: rpcError } = await supabase.rpc("delete_user_account");
      if (rpcError) throw rpcError;

      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
      setDeletingAccount(false);
    }
  }

  if (loading) {
    return (
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-gray-500">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-gray-900">Sign In to Continue</p>
        <p className="mt-1 text-xs text-gray-500">No active session found or your previous session expired.</p>
        <button
          type="button"
          onClick={() => {
            void supabase?.auth.signOut();
            window.location.reload();
          }}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const isSeller = profile?.role === "seller";
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Student";
  const businessName = profile?.business_name;

  return (
    <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-extrabold text-white shadow-md shadow-blue-500/20">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-extrabold text-gray-900">{displayName}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isSeller ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {isSeller ? "Student Seller" : "Student Customer"}
            </span>
          </div>
          <p className="flex items-center gap-1.5 truncate text-xs text-gray-500 mt-1">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            {user.email}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex gap-2 border-b border-gray-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "overview" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("edit-profile")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "edit-profile" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "security" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Password &amp; Security
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-4">
          {isSeller ? (
            <Link
              href="/seller"
              className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/50 p-4 transition-all hover:bg-purple-100/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-purple-950">
                    {businessName || "My Campus Shop"}
                  </p>
                  <p className="text-xs text-purple-700">
                    {listingCount} items listed &bull; Manage products &amp; orders
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href="/register-business"
              className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-4 transition-all hover:bg-blue-100/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-blue-950">Start Selling on UHASMART</p>
                  <p className="text-xs text-blue-700">Register your brand and reach students</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <Link
            href="/messages"
            className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-100/70"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">Inquiry Messages</p>
                <p className="text-xs text-gray-500">Private buyer &amp; seller chats</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/60 p-4 transition-all hover:bg-purple-100/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-purple-900">Admin Control Center</p>
                  <p className="text-xs text-purple-700">Moderation, users &amp; queue</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === "edit-profile" && (
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {isSeller && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Business / Brand Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editBusinessName}
                    onChange={(e) => setEditBusinessName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                  WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
              Campus Location / Hostel
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Sokode Campus / Asikuma Hostel"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>Save Profile Changes</span>
          </button>
        </form>
      )}

      {/* TAB 3: PASSWORD & SECURITY */}
      {activeTab === "security" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Change Password</h2>

            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Update Password</span>
            </button>
          </form>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
            <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Danger Zone
            </h3>
            <p className="mt-1 text-xs text-red-700">
              Permanently delete your UHASMART account, products, and inquiry data.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3.5 py-2 text-xs font-bold text-red-700 shadow-sm hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Button */}
      <div className="mt-8 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-gray-900">Are you absolutely sure?</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              This action cannot be undone. All your listings, messages, and profile information will be deleted.
            </p>
            <p className="mt-3 text-xs font-bold text-gray-800">
              Please type <span className="font-mono text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-red-600 focus:outline-none"
            />
            {deleteError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{deleteError}</p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                  setDeleteError("");
                }}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount || deleteConfirmation !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAccount ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
