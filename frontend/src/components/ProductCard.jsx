import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const resolvedSrc = resolveImageUrl(product?.image) || PLACEHOLDER_IMAGE;
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setImgSrc(resolveImageUrl(product?.image) || PLACEHOLDER_IMAGE);
  }, [product?.image]);

  if (!product) return null;

  const isOutOfStock = Number(product.stock) <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${product._id}` } });
      return;
    }

    if (isOutOfStock) return;

    setAdding(true);
    setFeedback("");
    try {
      await addToCart(product._id, 1);
      setFeedback("Added");
      setTimeout(() => setFeedback(""), 1500);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <Link
          to={`/products/${product._id}`}
          className="block aspect-4/3 overflow-hidden bg-slate-100"
        >
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => {
              if (imgSrc !== PLACEHOLDER_IMAGE) {
                setImgSrc(PLACEHOLDER_IMAGE);
              }
            }}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {product.category}
            </span>
            <span className="font-medium text-amber-600">
              ★ {Number(product.rating || 4.5).toFixed(1)}
            </span>
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-slate-900">
              {formatINR(product.price)}
            </span>
            <p className="text-xs text-slate-500">
              {isOutOfStock ? (
                <span className="font-medium text-rose-600">Out of stock</span>
              ) : (
                <span>{product.stock} in stock</span>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {adding
              ? "Adding..."
              : feedback || (isOutOfStock ? "Sold Out" : "Add to Cart")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
