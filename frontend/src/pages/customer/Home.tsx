import { Link } from 'react-router-dom';

const features = [
  { title: 'Products', desc: 'Browse the catalog', to: '/products' },
  { title: 'Categories', desc: 'Shop by category', to: '/categories/food-snacks' },
  { title: 'My Account', desc: 'Orders and profile', to: '/account' },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 to-brand-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">CRUNCHX</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            Fresh, healthy and crunchy snacks delivered to your door — backed by a
            complete inventory and production system.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50">
              Shop Now
            </Link>
            <Link to="/register" className="btn border border-white/40 text-white hover:bg-white/10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Link key={f.title} to={f.to} className="card p-6 hover:shadow-md">
              <h3 className="text-lg font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}