import { useState } from "react";
import { Link } from "react-router-dom";

const InfoPage = ({ type }) => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          ← Back to VISTORA Catalog
        </Link>
      </div>

      {type === "about" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            About VISTORA
          </h1>
          <p className="mt-2 text-sm font-medium text-purple-600">
            Shop Smarter. Live Better.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
            VISTORA is a modern full-stack e-commerce storefront built with the
            MERN stack (MongoDB, Express, React, and Node.js). It brings
            together product discovery, category filtering, cart management,
            order tracking, and an admin dashboard in a clean, responsive
            interface.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Storefront
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Curated Catalog &amp; Search
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Accounts &amp; Orders
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Seamless Cart &amp; Order Flow
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Admin Controls
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Inventory &amp; Store Management
              </p>
            </div>
          </div>
        </section>
      )}

      {type === "contact" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Contact VISTORA
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Have a question, feedback, or inquiry? Reach out using the details
            below or send a message directly.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Phone
                </p>
                <a
                  href="tel:+919310951517"
                  className="mt-1 inline-block font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  +919310951517
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Email
                </p>
                <a
                  href="mailto:manishmandal0611@gmail.com"
                  className="mt-1 inline-block font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  manishmandal0611@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Address
                </p>
                <p className="mt-1 leading-relaxed text-slate-800">
                  Vandana vihar, Khora colony, Ghaziabad, Uttar Pradesh (201020)
                </p>
              </div>
            </div>

            <div>
              {sent && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
                  Message sent! Thank you for contacting VISTORA.
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <input
                  type="text"
                  name="name"
                  required
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Your Email"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  placeholder="Subject"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Write your message..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {type === "terms" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Terms &amp; Conditions
          </h1>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
            <p>
              By accessing and using VISTORA, you agree to use the storefront
              and its features lawfully and for intended shopping or
              demonstration purposes.
            </p>
            <p>
              Product availability, pricing, and stock counts shown in the
              catalog are subject to updates and administrative management.
            </p>
            <p>
              Users are responsible for maintaining the confidentiality of their
              account login credentials and activity under their account.
            </p>
          </div>
        </section>
      )}

      {type === "privacy" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Privacy Policy
          </h1>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
            <p>
              VISTORA respects your privacy. Information such as your name,
              email address, and delivery city is used only to support account
              features, cart persistence, and order workflows.
            </p>
            <p>
              We do not sell personal user data to third parties. For questions
              regarding your information, contact{" "}
              <a
                href="mailto:manishmandal0611@gmail.com"
                className="font-medium text-indigo-600 hover:underline"
              >
                manishmandal0611@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default InfoPage;
