import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CatalogService, ProductDetail as DetailType, ProductVariant } from '../../services/catalog';
import { OrderService } from '../../services/orders';
import Spinner from '../../components/Spinner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<DetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    CatalogService.getProductBySlug(slug)
      .then((data) => {
        setDetail(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      })
      .catch((err) => setError(CatalogService.errorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  const getSessionToken = () => {
    let token = localStorage.getItem('crunchx_session_token');
    if (!token) {
      token = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('crunchx_session_token', token);
    }
    return token;
  };

  const handleAddToCart = async () => {
    if (!detail) return;
    try {
      await OrderService.addToCart(
        detail.product.id,
        quantity,
        selectedVariant?.sku ? undefined : null,
        getSessionToken()
      );
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  const handleBuyNow = async () => {
    if (!detail) return;
    try {
      await OrderService.addToCart(
        detail.product.id,
        quantity,
        selectedVariant?.sku ? undefined : null,
        getSessionToken()
      );
      navigate('/checkout');
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🍿</div>
        <h1 className="text-2xl font-bold text-slate-900">Snack Not Found</h1>
        <p className="text-slate-600 text-sm">We could not find the product you requested.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold">
          Explore All Snacks
        </Link>
      </div>
    );
  }

  const p = detail.product;
  const price = Number(p.selling_price) > 0 ? Number(p.selling_price) : Number(p.price);
  const mrp = Number(p.mrp) || 0;
  const hasDiscount = mrp > price;

  const images = detail.images && detail.images.length > 0 ? detail.images : [{ url: '', alt_text: p.name }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-bounce">
          <span>✓</span>
          <span>Added to your cart!</span>
          <Link to="/cart" className="text-emerald-400 hover:text-emerald-300 underline text-xs ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600">Snacks</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
            {images[activeImageIndex]?.url ? (
              <img
                src={images[activeImageIndex].url}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-9xl">🍿</span>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                {Math.round(((mrp - price) / mrp) * 100)}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex items-center justify-center bg-slate-50 flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.alt_text || p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍿</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              {p.category_name || 'CRUNCHX ORGANICS'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {p.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">SKU: {p.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-mono text-slate-900">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-base line-through text-slate-400 font-mono">${mrp.toFixed(2)}</span>
            )}
            <span className="text-xs text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {p.short_description || p.description || 'Crispy, crunchy, and packed with wholesome goodness.'}
          </p>

          {/* Health & Dietary Badges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Health Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {['Gluten-Free', '100% Vegan', 'Non-GMO', 'No Artificial Preservatives', 'Keto Friendly'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200"
                >
                  🌱 {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Variant Selector */}
          {detail.variants && detail.variants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Pack Size</h3>
              <div className="flex flex-wrap gap-3">
                {detail.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                      selectedVariant?.sku === v.sku
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.name || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>Add to Cart — ${(price * quantity).toFixed(2)}</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow transition-all text-sm"
            >
              Buy Now with 1-Click Checkout
            </button>
          </div>

          {/* Nutrition Facts Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Nutrition Information (Per 30g Serving)</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Calories</span>
                <span className="font-bold text-slate-900 text-sm">130 kcal</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Protein</span>
                <span className="font-bold text-emerald-600 text-sm">6g</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Dietary Fiber</span>
                <span className="font-bold text-emerald-600 text-sm">4g</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Total Fat</span>
                <span className="font-bold text-slate-900 text-sm">4.5g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
