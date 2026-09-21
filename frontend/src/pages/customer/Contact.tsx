import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Get in Touch With Us
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Have questions about your order, bulk wholesale inquiries, or nutritional information?
          Our customer support and logistics team are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 bg-emerald-900 text-white rounded-2xl p-8 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Contact Information</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Reach out directly or send us an inquiry. We typically reply within 2 business hours.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Corporate & Production Hub</p>
                  <p className="text-emerald-200 text-xs mt-0.5">Plot 42, Food Tech SEZ, Phase 2, Bangalore, KA, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-emerald-200 text-xs">support@crunchx.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold">Toll-Free Helpline</p>
                  <p className="text-emerald-200 text-xs">+91 1800-CRUNCH-X (Mon - Sat)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiClock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-emerald-200 text-xs">09:00 AM – 07:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/80 text-xs text-emerald-300">
            For wholesale or corporate distribution partnerships, select "Wholesale" in the inquiry form.
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you for contacting CRUNCHX. Our team will review your query and respond to{' '}
                <span className="font-semibold text-gray-800">{form.email}</span> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Us a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="Order Status & Delivery">Order Status & Delivery</option>
                  <option value="Product Nutrition & Allergens">Product Nutrition & Allergens</option>
                  <option value="Wholesale & Bulk Orders">Wholesale & Bulk Distribution</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can assist you..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                <FiSend className="w-4 h-4" /> Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
