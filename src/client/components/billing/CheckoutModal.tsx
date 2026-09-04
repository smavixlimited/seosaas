import * as React from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  ExternalLink,
  Globe,
  Lock,
  Receipt,
  ShieldCheck,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/client/lib/currency";
import { BRAND_CONFIG } from "@/config/brand";
import {
  initializePaystackCheckoutServerFn,
  submitManualPaymentServerFn,
} from "@/serverFunctions/billing-gateways";
import { validateCouponServerFn } from "@/serverFunctions/coupons";
import type { CouponValidationResult } from "@/services/coupons.service";

export interface PlanItem {
  id: string;
  name: string;
  priceUsd: number;
  priceNgn: number;
  billingInterval?: string;
  limits?: unknown;
  features?: unknown;
}

interface CheckoutModalProps {
  plan: PlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CheckoutModal({ plan, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { currency, formatPrice } = useCurrency();
  const [selectedGateway, setSelectedGateway] = React.useState<"paystack" | "lemonsqueezy" | "manual">("paystack");
  const [loading, setLoading] = React.useState(false);
  const [reference, setReference] = React.useState("");
  const [receiptUrl, setReceiptUrl] = React.useState("");
  const [userNotes, setUserNotes] = React.useState("");
  const [manualSuccess, setManualSuccess] = React.useState(false);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = React.useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState<CouponValidationResult | null>(null);

  if (!isOpen || !plan) return null;

  const basePrice = currency === "NGN" ? plan.priceNgn : plan.priceUsd;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const currentPrice = Math.max(0, basePrice - discountAmount);

  const formattedBaseAmount = formatPrice(plan.priceUsd, plan.priceNgn);
  const formattedDiscountAmount = currency === "NGN"
    ? `₦${discountAmount.toLocaleString()}`
    : `$${discountAmount.toFixed(2)}`;
  const formattedFinalAmount = currency === "NGN"
    ? `₦${currentPrice.toLocaleString()}`
    : `$${currentPrice.toFixed(2)}`;

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = couponCodeInput.trim();
    if (!cleanCode) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await validateCouponServerFn({
        data: {
          code: cleanCode,
          planId: plan.id,
          amount: basePrice,
          currency,
        },
      });

      if (res.valid && res.coupon) {
        setAppliedCoupon(res);
        toast.success(`Promo code "${res.coupon.code}" applied successfully!`);
      } else {
        toast.error(res.error || "Invalid promo code");
        setAppliedCoupon(null);
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast.info("Promo code removed");
  };

  const handlePaystackCheckout = async () => {
    setLoading(true);
    try {
      const res = await initializePaystackCheckoutServerFn({
        data: {
          planId: plan.id,
          amountNgn: currency === "NGN" ? currentPrice : Math.round(currentPrice * 1500),
          callbackUrl: window.location.origin + "/billing?status=success",
        },
      });

      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch (err) {
      alert("Checkout initialization failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      alert("Please provide the bank transaction reference number.");
      return;
    }

    setLoading(true);
    try {
      await submitManualPaymentServerFn({
        data: {
          planId: plan.id,
          amount: currentPrice,
          currency,
          transactionReference: reference.trim(),
          receiptUrl: receiptUrl.trim() || null,
          userNotes: (userNotes.trim() ? userNotes.trim() + " " : "") + (appliedCoupon ? `[Coupon: ${appliedCoupon.coupon?.code}]` : ""),
        },
      });
      setManualSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Failed to submit receipt: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-6 text-base-content max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300/60 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Subscribe to Plan
            </span>
            <h2 className="text-2xl font-black text-base-content mt-0.5">
              {plan.name} Tier
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Plan Summary & Pricing Breakdown Badge */}
        <div className="rounded-2xl bg-base-200/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-base-content/70">Subscription Tier</span>
              <div className="text-lg font-black text-base-content">{plan.name}</div>
            </div>
            <span className="badge badge-primary badge-sm font-bold uppercase">
              {plan.id}
            </span>
          </div>

          <div className="pt-2 border-t border-base-300/60 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-base-content/60 font-medium">Amount Due:</span>
              {appliedCoupon ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-base-content/50 line-through font-mono">
                    {formattedBaseAmount}
                  </span>
                  <span className="text-xl font-black text-primary font-mono">
                    {formattedFinalAmount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    Saved {formattedDiscountAmount}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-black text-base-content font-mono">
                  {formattedBaseAmount}
                </div>
              )}
            </div>
            <span className="text-[11px] text-base-content/50 font-medium">Billed Monthly</span>
          </div>
        </div>

        {/* Promo Code Input & Badge */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-3.5 space-y-2">
          {appliedCoupon && appliedCoupon.coupon ? (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Tag className="h-4 w-4 shrink-0" />
                <div>
                  <span className="font-mono font-bold">{appliedCoupon.coupon.code}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-500 ml-1.5">
                    ({appliedCoupon.coupon.discountType === "percentage" ? `${appliedCoupon.coupon.discountValue}% OFF` : `Saved ${formattedDiscountAmount}`})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="btn btn-ghost btn-circle btn-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                title="Remove promo code"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Have a promo code? (e.g. LAUNCH50)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleApplyCoupon();
                    }
                  }}
                  className="input input-bordered input-sm w-full rounded-xl pl-8.5 font-mono text-xs uppercase"
                />
              </div>
              <button
                type="button"
                disabled={isValidatingCoupon || !couponCodeInput.trim()}
                onClick={() => void handleApplyCoupon()}
                className="btn btn-primary btn-sm rounded-xl px-4 font-bold text-white shrink-0 shadow-sm"
              >
                {isValidatingCoupon ? "Validating..." : "Apply"}
              </button>
            </div>
          )}
        </div>

        {manualSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-base-content">Receipt Submitted!</h3>
            <p className="text-xs text-base-content/70 max-w-sm mx-auto leading-relaxed">
              Your transfer details (Ref: <span className="font-mono font-bold">{reference}</span>) have been sent to our superadmin review team. Your subscription will activate shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm rounded-xl font-bold px-6 text-white mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-base-content/70">
                Select Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Paystack */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway("paystack")}
                  className={`rounded-2xl border p-3.5 text-left transition-all flex flex-col justify-between space-y-2 ${
                    selectedGateway === "paystack"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-base-300 bg-base-100 hover:border-base-content/30"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-bold text-base-content">Paystack</div>
                    <div className="text-[10px] text-base-content/60">Cards, USSD, NGN</div>
                  </div>
                </button>

                {/* LemonSqueezy */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway("lemonsqueezy")}
                  className={`rounded-2xl border p-3.5 text-left transition-all flex flex-col justify-between space-y-2 ${
                    selectedGateway === "lemonsqueezy"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-base-300 bg-base-100 hover:border-base-content/30"
                  }`}
                >
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-base-content">International</div>
                    <div className="text-[10px] text-base-content/60">Stripe / USD</div>
                  </div>
                </button>

                {/* Manual Bank Wire */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway("manual")}
                  className={`rounded-2xl border p-3.5 text-left transition-all flex flex-col justify-between space-y-2 ${
                    selectedGateway === "manual"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-base-300 bg-base-100 hover:border-base-content/30"
                  }`}
                >
                  <Receipt className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-base-content">Bank Wire</div>
                    <div className="text-[10px] text-base-content/60">Direct Transfer</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Gateway Specific Form View */}
            {selectedGateway === "paystack" && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1.5 text-base-content/80">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Instant Activation with Paystack
                  </div>
                  <p>
                    Pay securely using your Nigerian Naira debit card, USSD code, or instant bank transfer. Your {plan.name} features and monthly credits activate immediately upon payment.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePaystackCheckout}
                  className="btn btn-primary rounded-2xl w-full font-bold text-white shadow-md shadow-primary/25"
                >
                  {loading ? "Redirecting to Paystack..." : `Pay ${formattedFinalAmount} Now`}
                </button>
              </div>
            )}

            {selectedGateway === "lemonsqueezy" && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs space-y-1.5 text-base-content/80">
                  <div className="font-bold text-blue-500 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> International Credit Card / PayPal
                  </div>
                  <p>
                    Subscribe seamlessly via standard USD billing supporting Visa, MasterCard, Amex, and Apple Pay.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePaystackCheckout}
                  className="btn btn-primary rounded-2xl w-full font-bold text-white shadow-md shadow-primary/25"
                >
                  Pay {formattedFinalAmount} with Global Card
                </button>
              </div>
            )}

            {selectedGateway === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
                <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4 space-y-2 text-xs">
                  <div className="font-bold text-base-content">
                    Official Bank Account Details:
                  </div>
                  <pre className="font-mono text-[11px] text-base-content/80 leading-relaxed bg-base-100 p-2.5 rounded-xl border border-base-300">
                    Bank: Access Bank PLC{"\n"}
                    Account Name: Skorvia Intelligence Ltd{"\n"}
                    Account Number: 0123456789{"\n"}
                    Amount to Pay: {formattedFinalAmount}
                  </pre>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/70">
                    Transaction Reference Number <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRF-2026-981249"
                    className="input input-bordered input-sm w-full rounded-xl font-mono text-xs"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/70">
                    Proof Screenshot / Receipt URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or image link"
                    className="input input-bordered input-sm w-full rounded-xl text-xs"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success rounded-2xl w-full font-bold text-white mt-2"
                >
                  {loading ? "Submitting Proof..." : "Submit Proof of Payment"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

