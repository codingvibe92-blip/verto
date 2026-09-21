import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CatalogService, Product, Category } from '../../services/catalog';
import { OrderService } from '../../services/orders';
import Spinner from '../../components/Spinner';

const healthFilterOptions = [
  { key: 'gluten_free', label: 'Gluten-Free', tag: 'gluten-free' },
  { key: 'vegan', label: '100% Vegan', tag: 'vegan' },
  { key: 'organic', label: 'Certified Organic', tag: 'organic' },
  { key: 'non_gmo', label: 'Non-GMO', tag: 'non-gmo' },
  { key: 'high_protein', label: 'High Protein', tag: 'high-protein' },
  { key: 'keto', label: 'Keto Friendly', tag: 'keto' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartNotice, setCartNotice] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('category') || '');
  const [selectedHealthTags, setSelectedHealthTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = {
        limit: 50,
        status: 'ACTIVE',
        sort: sortBy,
        order: sortOrder,
      };
      if (search) params.search = search;
      if (categoryId) params.category_id = Number(categoryId);

      const data = await CatalogService.listProducts(params);
      let list = data.rows;

      // Filter in frontend if health tags selected
      if (selectedHealthTags.length > 0) {
        list = list.filter((p) => {
          const tagsStr = `${p.tags || ''} ${p.description || ''} ${p.name}`.toLowerCase();
          return selectedHealthTags.some((tag) => tagsStr.includes(tag.toLowerCase()));
        });
      }

      setProducts(list);
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryId, sortBy, sortOrder, selectedHealthTags]);

  useEffect(() => {
    CatalogService.listCategories().then((res) => setCategories(res.rows)).catch(() => undefined);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const toggleHealthTag = (tag: string) => {
    setSelectedHealthTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    let sessionToken = localStorage.getItem('crunchx_session_token');
    if (!sessionToken) {
      sessionToken = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('crunchx_session_token', sessionToken);
    }

    try {
      await OrderService.addToCart(product.id, 1, null, sessionToken);
      setCartNotice(`Added "${product.name}" to cart!`);
      setTimeout(() => setCartNotice(''), 3000);
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {cartNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-bounce">
          <span>🍿</span>
          <span>{cartNotice}</span>
          <Link to="/cart" className="text-emerald-400 hover:text-emerald-300 underline text-xs ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* Catalog Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-lg space-y-3">
        <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/20">
          🌱 100% Wholesome Goodness
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Artisan Crunchy Snacks</h1>
        <p className="text-emerald-100 max-w-xl text-sm sm:text-base">
          Crafted with non-GMO ingredients, roasted to crispy perfection, and tailored for health-conscious foodies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Search</h3>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Keywords or flavors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </form>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => setCategoryId('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  categoryId === '' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(String(c.id))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    categoryId === String(c.id)
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Health & Dietary Filters */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Health & Dietary Tags
            </h3>
            <div className="space-y-2">
              {healthFilterOptions.map((opt) => {
                const checked = selectedHealthTags.includes(opt.tag);

                return (
                  <label key={opt.key} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHealthTag(opt.tag)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className={checked ? 'font-bold text-emerald-700' : ''}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Sort By</h3>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
            <span>Showing {products.length} wholesome products</span>
            {selectedHealthTags.length > 0 && (
              <button
                onClick={() => setSelectedHealthTags([])}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

          {loading ? (
            <div className="p-24 flex justify-center">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-bold text-slate-800">No snacks match your criteria</h3>
              <p className="text-slate-500 text-xs">Try selecting a different health tag or clearing search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const price = Number(p.selling_price) > 0 ? Number(p.selling_price) : Number(p.price);
                const hasDiscount = Number(p.mrp) > price;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Frame */}
                      <Link
                        to={`/products/${p.slug}`}
                        className="block aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      >
                        <span className="text-6xl">🍿</span>
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                            SALE
                          </span>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="p-5 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                          {p.category_name || 'Artisan Snack'}
                        </span>
                        <Link
                          to={`/products/${p.slug}`}
                          className="font-bold text-slate-900 hover:text-emerald-600 transition-colors block text-base leading-snug line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.short_description || p.description}</p>
                      </div>
                    </div>

                    {/* Bottom Price & Add To Cart */}
                    <div className="p-5 pt-0 space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black font-mono text-slate-900">${price.toFixed(2)}</span>
                        {p.mrp && Number(p.mrp) > price && (
                          <span className="text-xs line-through text-slate-400 font-mono">
                            ${Number(p.mrp).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>🛒</span>
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
