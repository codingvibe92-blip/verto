import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CatalogService, Product } from '../../services/catalog';
import { OrderService } from '../../services/orders';
import Spinner from '../../components/Spinner';
import { FiHeart, FiShoppingCart, FiTrash2, FiShoppingBag, FiCheck } from 'react-icons/fi';

export default function Wishlist() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // Load some sample products as wishlist items
    CatalogService.listProducts({ limit: 4, status: 'ACTIVE' })
      .then((res) => setItems(res.rows))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
    setNotice('Item removed from wishlist');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await OrderService.addToCart(product.id, undefined, 1);
      setNotice(`"${product.name}" moved to cart!`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Could not add item to cart.');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiHeart className="text-red-500 fill-red-500" /> My Saved Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">Keep track of snacks and protein bites you love.</p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
        >
          <FiShoppingBag /> Browse More
        </Link>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
          <FiCheck className="text-emerald-600" /> {notice}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Spinner />
          <p className="text-gray-400 text-xs mt-2">Loading your wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-400 flex items-center justify-center">
            <FiHeart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Discover wholesome, guilt-free snacks and click the heart icon to save them for later!
          </p>
          <Link
            to="/products"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all"
          >
            Start Snacking
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-36 bg-gray-50 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  <span className="text-gray-300 font-bold text-2xl tracking-widest uppercase">
                    CRUNCHX
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 rounded-full shadow-xs transition-colors"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">SKU: {item.sku}</p>

                <div className="mt-2 text-base font-bold text-emerald-700">
                  ₹{Number(item.selling_price || item.price || 149).toFixed(2)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <FiShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
