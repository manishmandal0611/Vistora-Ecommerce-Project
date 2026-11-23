import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadgeClass = (status) => {
  switch (status) {
    case "paid":
    case "delivered":
    case "shipped":
      return "bg-emerald-100 text-emerald-800";
    case "processing":
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/payments/orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your mock checkout transactions, payment statuses, and
            shipping details.
          </p>
        </div>

        <Link
          to="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Browse Catalog
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">No orders yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete a mock checkout from your cart to see your orders here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {order._id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Placed on {formatDate(order.createdAt)} • Gateway:{" "}
                    <span className="font-medium text-slate-700">
                      {order.paymentInfo?.provider || "mock"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                      order.paymentInfo?.status,
                    )}`}
                  >
                    Payment: {order.paymentInfo?.status || "pending"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus || "processing"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-sm">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-slate-700"
                  >
                    <span>
                      {item.name} ×{" "}
                      <strong className="font-semibold">{item.quantity}</strong>
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatINR((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row sm:items-center">
                <div>
                  {order.shippingAddress && (
                    <span>
                      Ship to:{" "}
                      <strong className="font-medium text-slate-800">
                        {[
                          order.shippingAddress.street,
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </strong>
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-slate-900">
                  Total: {formatINR(order.totalAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
