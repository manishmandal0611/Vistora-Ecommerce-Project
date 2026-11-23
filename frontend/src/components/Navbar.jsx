import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            aria-label="VISTORA Home"
            className="inline-flex items-center rounded-xl bg-slate-950 px-2.5 py-1.5 shadow-xs ring-1 ring-purple-500/30 transition hover:ring-purple-400/60"
          >
            {!logoError ? (
              <img
                src="/vistora-logo.png"
                alt="VISTORA — Shop Smarter. Live Better."
                onError={() => setLogoError(true)}
                className="h-8 w-auto object-contain sm:h-9"
              />
            ) : (
              <span className="text-lg font-extrabold tracking-wider text-white">
                VISTORA
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
            <Link to="/" className="hover:text-slate-900">
              Catalog
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="hover:text-slate-900">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-md bg-indigo-50 px-2.5 py-1 text-indigo-700 hover:bg-indigo-100"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Cart</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {totalItems}
              </span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi,{" "}
                <strong className="font-semibold text-slate-900">
                  {user?.name}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center justify-around border-t border-slate-100 bg-slate-50/70 px-2 py-1.5 text-xs font-medium text-slate-600 md:hidden">
          <Link to="/" className="px-2 py-1 hover:text-slate-900">
            Catalog
          </Link>
          <Link to="/orders" className="px-2 py-1 hover:text-slate-900">
            My Orders
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-2 py-1 text-indigo-700 hover:text-indigo-800"
            >
              Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
