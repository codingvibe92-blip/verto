import { Link } from 'react-router-dom';
import { FiAward, FiCheckCircle, FiShield, FiHeart } from 'react-icons/fi';

export default function About() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-4 px-4">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold tracking-wide uppercase">
          Our Mission & Craft
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Redefining Clean Nutrition, <span className="text-emerald-600">One Crunch at a Time</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          CRUNCHX was born out of a simple conviction: healthy snacking shouldn't feel like a compromise.
          We manufacture 100% wholesome, gluten-free, and nutrient-dense snacks with transparent ingredient sourcing.
        </p>
      </section>

      {/* Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            <FiShield className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Zero Artificial Additives</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            No preservatives, artificial flavor enhancers, or palm oils. Just raw super-seeds, roasted millets, and cold-pressed cold oils.
          </p>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            <FiAward className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">State-of-the-Art IMS</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every production batch is recipe-calibrated via our internal ERP and passes multi-stage quality checks before leaving our facilities.
          </p>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
            <FiHeart className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Health-First Formulations</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Whether you follow a Keto, Vegan, or Gluten-Free regimen, our snacks are laboratory-tested for macronutrient accuracy.
          </p>
        </div>
      </section>

      {/* Quality Commitment Banner */}
      <section className="bg-emerald-900 text-white rounded-3xl max-w-6xl mx-auto px-8 py-12 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold">100% Quality & Freshness Guarantee</h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            All our manufacturing facilities follow rigorous HACCP and FSSAI standards. We package with nitrogen flushing to maintain crunch without preservatives.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> Non-GMO Certified</span>
            <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> Gluten-Free Lab Tested</span>
            <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> 100% Plant-Based</span>
          </div>
        </div>

        <Link
          to="/products"
          className="bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all whitespace-nowrap"
        >
          Explore Catalog
        </Link>
      </section>
    </div>
  );
}
