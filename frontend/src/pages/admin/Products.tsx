import { useEffect, useRef, useState } from 'react';
import { CatalogService, Product, Category, Subcategory } from '../../services/catalog';
import ProductForm from '../../features/products/ProductForm';
import Spinner from '../../components/Spinner';
import {
  FiBox,
  FiPlus,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiTag,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: 'badge-success',
  DRAFT: 'badge-neutral',
  INACTIVE: 'badge-warning',
  OUT_OF_STOCK: 'badge-danger',
  ARCHIVED: 'badge-neutral',
};

const sortOptions = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price', label: 'Price (low–high)' },
  { value: 'selling_price', label: 'Selling price (low–high)' },
];

export default function Products() {
  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (categoryId) params.category_id = Number(categoryId);
      if (subcategoryId) params.subcategory_id = Number(subcategoryId);
      if (sort) params.sort = sort;
      if (order) params.order = order;
      const data = await CatalogService.listProducts(params);
      setRows(data.rows);
      setTotal(data.meta.total);
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, categoryId, subcategoryId, sort, order]);

  useEffect(() => {
    CatalogService.listCategories({ limit: 100 })
      .then((d) => setCategories(d.rows))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (categoryId) {
      CatalogService.listSubcategories({ category_id: Number(categoryId), limit: 100 })
        .then((d) => setSubcategories(d.rows))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);

  const remove = async (p: Product) => {
    if (!window.confirm(`Archive "${p.name}"?`)) return;
    try {
      await CatalogService.deleteProduct(p.id);
      await load();
    } catch (err) {
      window.alert(CatalogService.errorMessage(err));
    }
  };

  const exportCsv = async () => {
    setError('');
    try {
      await CatalogService.exportProducts({
        status: status || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        subcategory_id: subcategoryId ? Number(subcategoryId) : undefined,
      });
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    }
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    setError('');
    setNotice('');
    try {
      const result = await CatalogService.importProducts(file);
      setNotice(
        `Import complete — ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.` +
          (result.errors.length > 0 ? ` ${result.errors.length} row(s) failed.` : '')
      );
      await load();
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Product Catalog</h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              {total} items
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage your consumer goods catalog, retail pricing, minimum safety thresholds, and SKU definitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            className="btn-secondary btn-sm"
            onClick={exportCsv}
            title="Download products CSV"
          >
            <FiDownload className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            title="Upload products CSV"
          >
            <FiUpload className="h-3.5 w-3.5" />
            <span>{importing ? 'Importing…' : 'Import CSV'}</span>
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <FiPlus className="h-4 w-4" />
            <span>New Product</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onImportFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9.5 py-2 text-xs"
              placeholder="Search by product name, SKU, or tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <select
              className="input py-2 text-xs cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.keys(statusBadgeClasses).map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-44">
            <select
              className="input py-2 text-xs cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="w-44">
            <select
              className="input py-2 text-xs cursor-pointer disabled:opacity-50"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="w-44">
            <select
              className="input py-2 text-xs cursor-pointer"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Direction */}
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            title={order === 'asc' ? 'Ascending' : 'Descending'}
          >
            {order === 'asc' ? <FiArrowUp className="h-3.5 w-3.5" /> : <FiArrowDown className="h-3.5 w-3.5" />}
            <span>{order === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>

          <button className="btn-primary btn-sm" onClick={load}>
            <FiFilter className="h-3.5 w-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="th">Product</th>
                <th className="th">SKU</th>
                <th className="th">Category</th>
                <th className="th">Selling Price</th>
                <th className="th">Min Stock</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600 font-bold border border-blue-200/50">
                        <FiBox className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {p.tags && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <FiTag className="h-3 w-3" />
                            <span>{p.tags}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                      {p.sku}
                    </span>
                  </td>
                  <td className="td text-slate-600">
                    <div>{p.category_name ?? '—'}</div>
                    {p.subcategory_name && (
                      <div className="text-[11px] text-slate-400">{p.subcategory_name}</div>
                    )}
                  </td>
                  <td className="td font-bold text-slate-900">
                    ₹{Number(p.selling_price).toLocaleString('en-IN')}
                    {p.price && Number(p.price) > Number(p.selling_price) && (
                      <span className="ml-1.5 text-xs text-slate-400 line-through">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="td">
                    <span className="text-xs font-semibold text-slate-700">{p.min_stock}</span>
                    <span className="text-[11px] text-slate-400 ml-1">units</span>
                  </td>
                  <td className="td">
                    <span className={`badge ${statusBadgeClasses[p.status] || 'badge-neutral'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{p.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="td text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit Product"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Archive Product"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="td py-12 text-center text-slate-400">
                    <FiBox className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs mt-0.5">Try adjusting your search filters or add a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="py-8">
            <Spinner />
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing <span className="font-semibold text-slate-700">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-semibold text-slate-700">{total}</span> products
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FiChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-medium text-slate-700">Page {page}</span>
              <button
                className="btn-secondary btn-sm"
                disabled={page * 20 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <FiChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <ProductForm
          categories={categories}
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={async () => {
            await load();
            setFormOpen(false);
          }}
        />
      )}
    </div>
  );
}