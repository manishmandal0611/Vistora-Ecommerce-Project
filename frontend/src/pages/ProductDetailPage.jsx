import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/imageUrl";

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#f1f5f9"/>
    <rect x="240" y="165" width="320" height="210" rx="16" fill="#e2e8f0"/>
    <circle cx="330" cy="235" r="24" fill="#cbd5e1"/>
    <path d="M270 345 L355 275 L415 320 L465 265 L530 345 Z" fill="#94a3b8"/>
    <text x="400" y="425" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#64748b">Product Image Unavailable</text>
  </svg>`,
)}`;

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/products/${id}`);
        const loadedProduct = data.product || null;
        setProduct(loadedProduct);
        setImgSrc(resolveImageUrl(loadedProduct?.image) || PLACEHOLDER_IMAGE);
        setQuantity(1);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load product details",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${product._id}` } });
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    setError("");
    try {
      await addToCart(product._id, quantity);
      setStatusMessage(`${quantity} × ${product.name} added to your cart.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
        <Link
          to="/"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const maxStock = Number(product.stock) || 0;
  const isOutOfStock = maxStock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Catalog
      </Link>

      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 lg:p-8">
        <div className="flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-4">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => {
              if (imgSrc !== PLACEHOLDER_IMAGE) {
                setImgSrc(PLACEHOLDER_IMAGE);
              }
            }}
            className="h-full max-h-[460px] w-full object-contain"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-indigo-700">
                {product.category}
              </span>
              {product.brand && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                  {product.brand}
                </span>
              )}
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700">
                ★ {Number(product.rating || 4.5).toFixed(1)}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {formatINR(product.price)}
            </p>

            <div className="mt-3 text-sm">
              {isOutOfStock ? (
                <span className="font-semibold text-rose-600">
                  Currently Out of Stock
                </span>
              ) : (
                <span className="font-medium text-emerald-700">
                  In Stock ({maxStock} units available)
                </span>
              )}
            </div>

            <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            {statusMessage && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
                <span>{statusMessage}</span>
                <Link
                  to="/cart"
                  className="font-semibold underline hover:text-emerald-950"
                >
                  View Cart
                </Link>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {!isOutOfStock && (
                <div className="flex items-center rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(maxStock, q + 1))
                    }
                    className="px-3.5 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={isOutOfStock || submitting}
                onClick={handleAddToCart}
                className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting
                  ? "Adding to Cart..."
                  : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
