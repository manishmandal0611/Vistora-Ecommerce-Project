import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const CartPage = () => {
  const {
    items,
    subtotal,
    cartLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState("");
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const handleQtyChange = async (productId, nextQty) => {
    setBusyId(productId);
    setError("");
    try {
      await updateQuantity(productId, nextQty);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update quantity");
    } finally {
      setBusyId("");
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setError("");
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove item");
    } finally {
      setBusyId("");
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    setError("");
    try {
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to clear cart");
    } finally {
      setClearing(false);
    }
  };

  if (cartLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900">
            Your Cart is Empty
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Browse the catalog and add products to start your order.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const taxAmount = Number((subtotal * 0.18).toFixed(2));
  const shippingFee = subtotal >= 999 ? 0 : 79;
  const grandTotal = Number((subtotal + taxAmount + shippingFee).toFixed(2));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review item quantities and shipping estimates before checkout.
          </p>
        </div>

        <button
          type="button"
          disabled={clearing}
          onClick={handleClearCart}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          {clearing ? "Clearing..." : "Clear Cart"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const isBusy = busyId === product._id;
            const unitPrice = product.price ?? item.priceAtAddition;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div
                key={product._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-base font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {product.category} • Unit Price: {formatINR(unitPrice)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Stock available: {product.stock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button
                      type="button"
                      disabled={isBusy || item.quantity <= 1}
                      onClick={() =>
                        handleQtyChange(product._id, item.quantity - 1)
                      }
                      className="px-2.5 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isBusy || item.quantity >= product.stock}
                      onClick={() =>
                        handleQtyChange(product._id, item.quantity + 1)
                      }
                      className="px-2.5 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="min-w-24 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatINR(lineTotal)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleRemove(product._id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          <div className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">
                {formatINR(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated GST (18%)</span>
              <span className="font-medium text-slate-900">
                {formatINR(taxAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping (Free above ₹999)</span>
              <span className="font-medium text-slate-900">
                {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatINR(grandTotal)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Proceed to Mock Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
