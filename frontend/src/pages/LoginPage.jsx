import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/";

  const handleAdminLoginClick = () => {
    setIsAdminLogin(true);
    setEmail("admin@vistora.dev");
    setError("");
    const passwordInput = document.getElementById("login-password");
    if (passwordInput) {
      passwordInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      if (
        isAdminLogin &&
        (!location.state?.from || location.state?.from === "/")
      ) {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setIsAdminLogin(false);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdminLogin ? "Admin Sign in" : "Sign in"}
          </h1>
          {isAdminLogin && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Admin Mode
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {isAdminLogin
            ? "Sign in with your administrator credentials to manage catalog products."
            : "Access your VISTORA cart, orders, and account settings."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                isAdminLogin ? "admin@vistora.dev" : "you@example.com"
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting
              ? "Signing in..."
              : isAdminLogin
                ? "Sign In as Admin"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-xs font-semibold text-slate-700">
            Quick Fill Demo Account:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                fillDemoAccount("customer@vistora.dev", "Password123!")
              }
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={handleAdminLoginClick}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                isAdminLogin
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              Admin Login
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          New to VISTORA?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
