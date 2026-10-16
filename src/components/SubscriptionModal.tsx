"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  MOMO_NETWORKS,
  SubscriptionPlan,
  MoMoNetwork,
  processMoMoSubscriptionPayment,
  SubscriptionState,
} from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/client";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultPhone?: string | null;
  subscriptionState: SubscriptionState;
  onSuccess: (newExpiry: string) => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  userId,
  defaultPhone,
  subscriptionState,
  onSuccess,
}: SubscriptionModalProps) {
  const supabase = createClient();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]); // default to Semester
  const [selectedNetwork, setSelectedNetwork] = useState<MoMoNetwork>(MOMO_NETWORKS[0]); // default to MTN
  const [momoNumber, setMomoNumber] = useState(defaultPhone || "");
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "prompting" | "success">("select");
  const [errorMessage, setErrorMessage] = useState("");
  const [successDate, setSuccessDate] = useState("");

  if (!isOpen) return null;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !userId) return;

    const cleanedNumber = momoNumber.replace(/\s+/g, "").trim();
    if (cleanedNumber.length < 10) {
      setErrorMessage("Please enter a valid Ghanaian Mobile Money phone number (e.g. 024XXXXXXX).");
      return;
    }

    setErrorMessage("");
    setProcessing(true);
    setPaymentStep("prompting");

    try {
      // Simulate authentic mobile money network prompt latency
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const result = await processMoMoSubscriptionPayment({
        supabase,
        userId,
        plan: selectedPlan,
        momoNetwork: selectedNetwork.id,
        momoNumber: cleanedNumber,
      });

      if (result.success) {
        setPaymentStep("success");
        const formatted = result.newExpiry
          ? new Date(result.newExpiry).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "30 days";
        setSuccessDate(formatted);
        onSuccess(result.newExpiry || "");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setPaymentStep("select");
    } finally {
      setProcessing(false);
    }
  }

  function handleReset() {
    setPaymentStep("select");
    setErrorMessage("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleReset}
    >
      <div
        className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-white shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Pull Bar on mobile */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-gray-900">Seller Subscription</h3>
              <p className="text-[11px] text-gray-500">Instant Mobile Money Activation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* STEP 1: SELECT & PAY */}
          {paymentStep === "select" && (
            <form onSubmit={handlePay} className="space-y-5">
              {/* Status Banner */}
              <div
                className={`rounded-2xl p-4 border text-xs leading-relaxed ${
                  subscriptionState.isExpired
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : subscriptionState.daysRemaining <= 5
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {subscriptionState.isExpired ? (
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  )}
                  <span>
                    {subscriptionState.isExpired
                      ? "Your 30-Day Free Trial Has Expired"
                      : subscriptionState.isTrial
                      ? `30-Day Free Trial Active (${subscriptionState.daysRemaining} days remaining)`
                      : `Active Subscription (Renews on ${subscriptionState.formattedExpiry})`}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {subscriptionState.isExpired
                    ? "Your products are saved safely, but currently hidden from buyers. Subscribe with Mobile Money below to instantly reactivate them."
                    : "Renew early to keep your student listings live and visible to buyers across all of Ho."}
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Plan Cards */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">
                  Choose Subscription Plan
                </label>
                <div className="space-y-2.5">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all active:scale-[0.99] ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{plan.name}</span>
                            {plan.badge && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-500 leading-normal">{plan.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-blue-600">GHS {plan.priceGhs}</p>
                          <span
                            className={`mt-1 inline-block h-4 w-4 rounded-full border-2 ${
                              isSelected ? "border-blue-600 bg-blue-600 ring-2 ring-white" : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Money Network Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                  Select Mobile Money Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOMO_NETWORKS.map((network) => {
                    const isSelected = selectedNetwork.id === network.id;
                    return (
                      <button
                        key={network.id}
                        type="button"
                        onClick={() => setSelectedNetwork(network)}
                        className={`rounded-2xl border p-3 text-center transition-all active:scale-95 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-xl text-white text-[10px] font-black ${network.color}`}
                        >
                          MoMo
                        </div>
                        <p className="mt-1.5 text-[11px] font-bold text-gray-900 truncate">{network.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MoMo Phone Number Input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">
                  {selectedNetwork.name} Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="e.g. 0241234567"
                    className="w-full rounded-2xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-xs font-bold text-gray-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  A Mobile Money prompt will be sent to this number for authorization.
                </p>
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Zap className="h-4 w-4" />
                <span>Pay GHS {selectedPlan.priceGhs}.00 with Mobile Money</span>
              </button>
            </form>
          )}

          {/* STEP 2: PROMPTING PHONE */}
          {paymentStep === "prompting" && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 animate-pulse border border-amber-200">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-black text-gray-900">Authorizing Mobile Money</h4>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Prompting <span className="font-bold text-gray-800">{momoNumber}</span> via{" "}
                  <span className="font-bold text-gray-800">{selectedNetwork.name}</span>. Please approve with your
                  MoMo PIN...
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-[11px] text-gray-500 border border-gray-100">
                Amount: <strong className="text-gray-900">GHS {selectedPlan.priceGhs}.00</strong> &bull; Plan:{" "}
                <strong className="text-gray-900">{selectedPlan.name}</strong>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {paymentStep === "success" && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Subscription Activated</span>
                </div>
                <h4 className="text-lg font-black text-gray-900">Payment Successful!</h4>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your seller account is now fully active until{" "}
                  <strong className="text-gray-900">{successDate}</strong>. All your listings are live on UHASMART!
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-bold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">GHS {selectedPlan.priceGhs}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network:</span>
                  <span className="font-bold text-gray-900">{selectedNetwork.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">New Expiry:</span>
                  <span className="font-bold text-blue-600">{successDate}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-black text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Done &bull; Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
