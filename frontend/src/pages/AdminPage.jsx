import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { resolveImageUrl } from "../utils/imageUrl";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "Electronics",
  brand: "",
  stock: "",
  image: "",
};

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Fitness",
  "Accessories",
];

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: data.imageUrl || "" }));
      setMessage("Image uploaded to local server.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleEditStart = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "Electronics",
      brand: product.brand || "",
      stock: String(product.stock ?? ""),
      image: product.image || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const numericPrice = Number(form.price);
    const numericStock = Number(form.stock);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price (0 or greater).");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Please enter a valid whole number for stock (0 or greater).");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: numericPrice,
      category: form.category,
      brand: form.brand.trim() || "Generic",
      stock: numericStock,
      image: form.image.trim() || FALLBACK_IMAGE,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        setMessage("New product created successfully.");
      }
      setEditingId(null);
      setForm(initialForm);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeletingId(productId);
    setMessage("");
    setError("");
    try {
      await api.delete(`/products/${productId}`);
      if (editingId === productId) {
        handleCancelEdit();
      }
      setMessage("Product deleted.");
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Admin Product Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, edit, and remove catalog products in MongoDB.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Wireless Noise-Cancelling Headphones"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="1"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="2499"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={handleChange}
                placeholder="25"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="AudioLab"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Upload Product Image (JPG, PNG, WEBP)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              disabled={uploading}
              onChange={handleImageUpload}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
            {uploading && (
              <p className="mt-1 text-xs font-medium text-indigo-600">
                Uploading image...
              </p>
            )}
            {form.image && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <img
                  src={resolveImageUrl(form.image) || FALLBACK_IMAGE}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="h-12 w-12 rounded-md object-cover bg-white"
                />
                <span className="truncate font-mono text-[11px] text-slate-600">
                  {form.image}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={form.description}
              onChange={handleChange}
              placeholder="Key features, build quality, and specs..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading
              ? "Uploading Image..."
              : saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Create Product"}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Catalog Inventory ({products.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-slate-500">
                Loading inventory...
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No products in catalog yet. Use the form to add one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                resolveImageUrl(product.image) || FALLBACK_IMAGE
                              }
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formatINR(product.price)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditStart(product)}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === product._id}
                              onClick={() => handleDelete(product._id)}
                              className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            >
                              {deletingId === product._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
