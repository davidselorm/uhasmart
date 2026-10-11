"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { campusLocations } from "@/lib/data";
import {
  Store,
  Phone,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface RegisterBusinessUpgradeProps {
  initialDisplayName?: string;
  onSuccess?: () => void;
}

export default function RegisterBusinessUpgrade({
  initialDisplayName = "",
  onSuccess,
}: RegisterBusinessUpgradeProps) {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [campusLocation, setCampusLocation] = useState(campusLocations[0].name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (!businessName.trim()) {
      setError("Please enter your business or brand name.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter your WhatsApp or phone number so students can contact you.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        throw new Error("You must be signed in to register a business.");
      }

      // Update public.profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          role: "seller",
          business_name: businessName.trim(),
          phone_number: phoneNumber.trim(),
          campus_location: campusLocation,
        })
        .eq("id", authData.user.id);

      if (profileErr) throw profileErr;

      // Update auth metadata for consistency
      await supabase.auth.updateUser({
        data: {
          role: "seller",
          business_name: businessName.trim(),
          phone_number: phoneNumber.trim(),
          campus_location: campusLocation,
        },
      });

      setSuccess("Your student business has been registered! You can now list products.");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/seller");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register business.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Student Seller Onboarding</span>
          <h2 className="text-xl font-extrabold text-gray-900">Register Your Business</h2>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        {initialDisplayName ? `Hi ${initialDisplayName}, upgrade` : "Upgrade"} your student customer account to a Student Seller to list products, food, thrift wear, or academic services on UHASMART.
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
            Business / Brand Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Campus Thrift Kicks, Mama's Pastries, DocTech"
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">This business name will appear on all your product listings.</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
            WhatsApp / Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0541234567 or 020..."
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Buyers on campus will click to chat directly with you on WhatsApp.</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
            Primary Location in Ho / Suburb <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <select
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-xs font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              {campusLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registering Business...</span>
            </>
          ) : (
            <>
              <span>Complete Registration & Start Selling</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
