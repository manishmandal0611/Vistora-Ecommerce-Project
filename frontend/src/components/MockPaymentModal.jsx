import { useState } from "react";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const MockPaymentModal = ({
  isOpen,
  onClose,
  provider = "mock_razorpay",
  amount = 0,
  gatewayOrderId = "",
  onConfirmPayment,
  processing = false,
}) => {
  const [simulateFailure, setSimulateFailure] = useState(false);

  if (!isOpen) return null;

  const providerLabel =
    provider === "mock_stripe"
      ? "Stripe Payment Gateway"
      : "Razorpay Payment Gateway";

  const handleConfirm = async () => {
    await onConfirmPayment({ simulateFailure });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Sandbox Mode
            </span>
            <h2
              id="payment-modal-title"
              className="mt-1.5 text-lg font-bold text-slate-900"
            >
              {providerLabel}
            </h2>
            {gatewayOrderId && (
              <p className="mt-0.5 font-mono text-xs text-slate-500">
                Ref: {gatewayOrderId}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={processing}
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-600">
              Amount Payable
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatINR(amount)}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Sandbox checkout confirmation—no real card, UPI, or bank charge
            occurs; confirming verifies the order via /api/payments/verify.
          </p>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs text-slate-700 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={simulateFailure}
              disabled={processing}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600"
            />
            <span>Simulate failed / declined payment</span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={processing}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleConfirm}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing
              ? "Verifying..."
              : simulateFailure
                ? "Simulate Failure"
                : `Authorize ${formatINR(amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
