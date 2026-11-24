import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const sanitizePaymentMessage = (msg, fallback) => {
  const raw = (msg || "").trim();
  if (!raw) return fallback;
  const cleaned = raw
    .replace(/\bmock\s+/gi, "")
    .replace(/\s+\(mock\)/gi, "")
    .replace(/\bmock\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned || fallback;
};

const CheckoutPage = () => {
  const { user, refreshUser } = useAuth();
  const { items, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [provider, setProvider] = useState("mock_razorpay");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (user?.address) {
      setShippingAddress({
        street: user.address.street || "",
        city: user.address.city || "",
        state: user.address.state || "",
        postalCode: user.address.postalCode || "",
        country: user.address.country || "India",
      });
    }
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Create pending order + gateway order ID
      const { data: orderRes } = await api.post("/payments/create-order", {
        provider,
        shippingAddress,
      });

      const createdOrder = orderRes.order;
      const gatewayOrderId = orderRes.gateway?.gatewayOrderId;

      // 2. Verify payment (or simulate failure)
      const { data: verifyRes } = await api.post("/payments/verify", {
        orderId: createdOrder._id,
        gatewayOrderId,
        simulateFailure,
      });

      setConfirmedOrder(verifyRes.order);
      await fetchCart();
      await refreshUser();
    } catch (err) {
      setError(
        sanitizePaymentMessage(
          err.response?.data?.message,
          "Checkout or payment verification failed",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-xs">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Order Confirmed
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Thank you for your order!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Order ID:{" "}
            <strong className="font-mono text-slate-900">
              {confirmedOrder._id}
            </strong>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Gateway Ref:{" "}
            <span className="font-mono">
              {confirmedOrder.paymentInfo?.gatewayPaymentId}
            </span>
          </p>

          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
            {confirmedOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-700">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
            <span>Paid Total</span>
            <span>{formatINR(confirmedOrder.totalAmount)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View Order History
            </button>
            <Link
              to="/"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            No items in cart to checkout
          </h1>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const taxAmount = Number((subtotal * 0.18).toFixed(2));
  const shippingFee = subtotal >= 999 ? 0 : 79;
  const grandTotal = Number((subtotal + taxAmount + shippingFee).toFixed(2));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Checkout
      </h1>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCheckoutSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Shipping Address
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  placeholder="123 MG Road"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  placeholder="Noida"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  placeholder="Uttar Pradesh"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  placeholder="201301"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            <p className="mt-1 text-xs text-slate-500">
              Test payment checkout—no real card or UPI charge occurs.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${
                  provider === "mock_razorpay"
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="mock_razorpay"
                  checked={provider === "mock_razorpay"}
                  onChange={(e) => setProvider(e.target.value)}
                  className="text-indigo-600"
                />
                <div>
                  <div className="font-semibold text-slate-900">Razorpay</div>
                  <div className="text-xs text-slate-500">
                    UPI / Cards / Netbanking
                  </div>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${
                  provider === "mock_stripe"
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="mock_stripe"
                  checked={provider === "mock_stripe"}
                  onChange={(e) => setProvider(e.target.value)}
                  className="text-indigo-600"
                />
                <div>
                  <div className="font-semibold text-slate-900">Stripe</div>
                  <div className="text-xs text-slate-500">
                    PaymentIntent Test Flow
                  </div>
                </div>
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Simulate declined / failed payment</span>
            </label>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Summary</h2>

          <div className="mt-4 space-y-2.5 border-b border-slate-100 pb-4 text-sm">
            {items.map((item) => {
              const p = item.product;
              if (!p) return null;
              return (
                <div
                  key={p._id}
                  className="flex justify-between text-slate-600"
                >
                  <span className="line-clamp-1 pr-2">
                    {p.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">
                    {formatINR(
                      (p.price ?? item.priceAtAddition) * item.quantity,
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span>{formatINR(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "FREE" : formatINR(shippingFee)}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-base font-bold text-slate-900">
            <span>Total Payable</span>
            <span>{formatINR(grandTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting
              ? "Processing Payment..."
              : `Pay ${formatINR(grandTotal)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
