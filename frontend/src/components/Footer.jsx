import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: Logo, Tagline, Socials & Quick Links */}
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center">
              {!logoError ? (
                <img
                  src="/vistora-logo.png"
                  alt="VISTORA — Shop Smarter. Live Better."
                  onError={() => setLogoError(true)}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-extrabold tracking-wider text-white">
                  VISTORA
                </span>
              )}
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="VISTORA Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-purple-500/60 hover:text-purple-400"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3.75a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm5.25-2.125a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25Z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="VISTORA Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-purple-500/60 hover:text-purple-400"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.29-.04-1.3-.13-2.47-.13-2.45 0-4.12 1.5-4.12 4.24v2.35H7.4v3.2h2.76V22h3.34Z" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="VISTORA Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-purple-500/60 hover:text-purple-400"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M21.5 6.6c-.7.3-1.45.5-2.24.6.8-.48 1.42-1.25 1.7-2.16-.75.45-1.58.77-2.47.95a3.9 3.9 0 0 0-6.64 3.55A11.06 11.06 0 0 1 3.8 5.37a3.9 3.9 0 0 0 1.2 5.2c-.64-.02-1.24-.2-1.76-.49v.05a3.9 3.9 0 0 0 3.13 3.82c-.33.09-.67.14-1.03.14-.25 0-.5-.02-.73-.07a3.9 3.9 0 0 0 3.64 2.7A7.82 7.82 0 0 1 2.6 18.4c-.31 0-.62-.02-.92-.05a11.02 11.02 0 0 0 5.97 1.75c7.17 0 11.09-5.94 11.09-11.09 0-.17 0-.34-.01-.5.76-.55 1.42-1.24 1.97-2.01Z" />
                </svg>
              </a>
            </div>

            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link
                  to="/about"
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Contact Us */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-wide text-white uppercase">
              CONTACT US
            </h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Call:{" "}
                <a
                  href="tel:+919310951517"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  +919310951517
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:manishmandal0611@gmail.com"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  manishmandal0611@gmail.com
                </a>
              </p>
              <p className="leading-relaxed">
                Add:{" "}
                <span className="text-slate-200 underline underline-offset-4">
                  Vandana vihar, Khora colony, Ghaziabad, Uttar Pradesh (201020)
                </span>
              </p>
            </div>
          </div>

          {/* Column 3: Keep Up to Date */}
          <div className="space-y-3">
            <h2 className="text-center text-lg font-bold tracking-wide text-white md:text-left">
              Keep Up to Date
            </h2>

            {submitted && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                Thanks! Your details have been received.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message for us..."
                  className="h-full min-h-[116px] w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
          © 2026 &ldquo;VISTORA&rdquo;. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
