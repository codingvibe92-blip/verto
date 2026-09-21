import { useEffect, useRef, useState } from 'react';
import { CatalogService, Product, Category, Subcategory } from '../../services/catalog';
import ProductForm from '../../features/products/ProductForm';
import Spinner from '../../components/Spinner';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-amber-100 text-amber-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-slate-200 text-slate-500',
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
    CatalogService.listCategories({ limit: 100 }).then((d) => setCategories(d.rows)).catch(() => undefined);
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={exportCsv}>Export CSV</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            + New Product
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => onImportFile(e.target.files?.[0])}
        />
      </div>

      {notice && <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by name, SKU, tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[150px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input max-w-[180px]" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input max-w-[180px]"
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          disabled={!categoryId}
        >
          <option value="">All subcategories</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select className="input max-w-[190px]" value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button className="btn-secondary" onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}>
          {order === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
        <button className="btn-secondary" onClick={load}>Search</button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">Product</th>
              <th className="th">SKU</th>
              <th className="th">Category</th>
              <th className="th">Selling Price</th>
              <th className="th">Stock (min)</th>
              <th className="th">Status</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="td font-medium text-slate-800">{p.name}</td>
                <td className="td">{p.sku}</td>
                <td className="td">
                  {p.category_name ?? '—'}
                  {p.subcategory_name ? ` / ${p.subcategory_name}` : ''}
                </td>
                <td className="td">₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                <td className="td">{p.min_stock}</td>
                <td className="td">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="td">
                  <div className="flex gap-2">
                    <button className="text-sm text-brand-600 hover:underline" onClick={() => { setEditing(p); setFormOpen(true); }}>
                      Edit
                    </button>
                    <button className="text-sm text-red-600 hover:underline" onClick={() => remove(p)}>
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="td py-10 text-center text-slate-400">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <Spinner />}
      </div>

      {total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{total} product(s)</span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="px-2 py-2">Page {page}</span>
            <button className="btn-secondary" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {formOpen && (
        <ProductForm
          categories={categories}
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={async () => { await load(); setFormOpen(false); }}
        />
      )}
    </div>
  );
}