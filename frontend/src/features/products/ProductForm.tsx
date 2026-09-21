import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CatalogService,
  Category,
  Product,
  ProductDetail,
  ProductPayload,
  Subcategory,
} from '../../services/catalog';
import Spinner from '../../components/Spinner';

interface Props {
  categories: Category[];
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  name: string;
  sku: string;
  brand: string;
  category_id: string;
  subcategory_id: string;
  price: string;
  selling_price: string;
  mrp: string;
  cost_price: string;
  tax_percent: string;
  discount_percent: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  min_stock: string;
  max_stock: string;
  status: string;
  tags: string;
  short_description: string;
  description: string;
  seo_title: string;
  seo_description: string;
  attributes_json: string;
}

interface ImageRow {
  url: string;
  alt_text: string;
  is_primary: boolean;
}

interface VariantRow {
  sku: string;
  name: string;
  price: string;
  selling_price: string;
}

const emptyVariant = (): VariantRow => ({ sku: '', name: '', price: '', selling_price: '' });

export default function ProductForm({ categories, product, onClose, onSaved }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      brand: product?.brand ?? '',
      category_id: product?.category_id ? String(product.category_id) : '',
      subcategory_id: product?.subcategory_id ? String(product.subcategory_id) : '',
      price: product?.price ?? '0',
      selling_price: product?.selling_price ?? '',
      mrp: product?.mrp ?? '',
      cost_price: product?.cost_price ?? '',
      tax_percent: product?.tax_percent ?? '0',
      discount_percent: product?.discount_percent ?? '0',
      weight: product?.weight ?? '',
      length: product?.length ?? '',
      width: product?.width ?? '',
      height: product?.height ?? '',
      min_stock: product?.min_stock ? String(product.min_stock) : '0',
      max_stock: product?.max_stock ? String(product.max_stock) : '',
      status: product?.status ?? 'DRAFT',
      tags: product?.tags ?? '',
      short_description: product?.short_description ?? '',
      description: product?.description ?? '',
      seo_title: product?.seo_title ?? '',
      seo_description: product?.seo_description ?? '',
      attributes_json: '',
    },
  });

  const [loading, setLoading] = useState(!!product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<ProductDetail | null>(null);

  const [images, setImages] = useState<ImageRow[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const watchCategoryId = watch('category_id');

  useEffect(() => {
    if (product) {
      CatalogService.getProduct(product.id)
        .then((d) => {
          setDetail(d);
          setImages(d.images.map((img) => ({
            url: img.url,
            alt_text: img.alt_text ?? '',
            is_primary: Boolean(img.is_primary),
          })));
          setVariants(d.variants.map((v) => ({
            sku: v.sku,
            name: v.name ?? '',
            price: v.price ? String(v.price) : '',
            selling_price: v.selling_price ? String(v.selling_price) : '',
          })));
          setError('');
        })
        .catch((err) => setError(CatalogService.errorMessage(err)))
        .finally(() => setLoading(false));
    }
  }, [product]);

  useEffect(() => {
    if (watchCategoryId) {
      CatalogService.listSubcategories({ category_id: Number(watchCategoryId), limit: 100 })
        .then((res) => setSubcategories(res.rows))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [watchCategoryId]);

  const onSavedDetail = async (values: FormValues) => {
    setError('');
    setSaving(true);

    const payload: ProductPayload = {
      sku: values.sku,
      name: values.name,
      price: Number(values.price || 0),
      selling_price: values.selling_price ? Number(values.selling_price) : undefined,
      mrp: values.mrp ? Number(values.mrp) : null,
      cost_price: values.cost_price ? Number(values.cost_price) : undefined,
      tax_percent: values.tax_percent ? Number(values.tax_percent) : undefined,
      discount_percent: values.discount_percent ? Number(values.discount_percent) : undefined,
      status: values.status,
      category_id: values.category_id ? Number(values.category_id) : null,
      subcategory_id: values.subcategory_id ? Number(values.subcategory_id) : null,
      brand: values.brand || null,
      short_description: values.short_description || undefined,
      description: values.description || undefined,
      tags: values.tags || undefined,
      weight: values.weight ? Number(values.weight) : null,
      length: values.length ? Number(values.length) : null,
      width: values.width ? Number(values.width) : null,
      height: values.height ? Number(values.height) : null,
      min_stock: values.min_stock ? Number(values.min_stock) : undefined,
      max_stock: values.max_stock ? Number(values.max_stock) : null,
      seo_title: values.seo_title || null,
      seo_description: values.seo_description || null,
    };

    if (images.length > 0) {
      payload.images = images.map((img, i) => ({
        url: img.url,
        alt_text: img.alt_text || null,
        is_primary: img.is_primary || (i === 0 && !images.some((x) => x.is_primary)),
        sort_order: i,
      }));
    }
    if (variants.length > 0) {
      payload.variants = variants
        .filter((v) => v.sku.trim())
        .map((v) => ({
          sku: v.sku.trim(),
          name: v.name.trim() || null,
          price: v.price ? Number(v.price) : undefined,
          selling_price: v.selling_price ? Number(v.selling_price) : undefined,
        }));
      if (variants.some((v) => !v.sku.trim())) {
        setError('Variant rows must include a SKU');
        setSaving(false);
        return;
      }
    }
    if (values.attributes_json.trim()) {
      try {
        const entries = JSON.parse(values.attributes_json) as Record<string, string>;
        payload.attributes = Object.entries(entries).map(([k, v]) => ({ attribute_key: k, attribute_value: v }));
      } catch {
        setError('Attributes must be valid JSON, e.g. {"allergens":"none"}');
        setSaving(false);
        return;
      }
    }

    try {
      if (product) {
        await CatalogService.updateProduct(product.id, payload);
      } else {
        await CatalogService.createProduct(payload);
      }
      onSaved();
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) {
      setError('Enter an image URL first');
      return;
    }
    setImages((prev) => [...prev, { url, alt_text: '', is_primary: prev.length === 0 }]);
    setImageUrl('');
    setError('');
  };

  const togglePrimary = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  };

  const updateImage = (idx: number, patch: Partial<ImageRow>) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx]?.is_primary && next.length > 0) next[0] = { ...next[0], is_primary: true };
      return next;
    });
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const updateVariant = (idx: number, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const cancelEdit = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="card my-8 w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{product ? `Edit ${product.name}` : 'New Product'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {detail && detail.images.length > 0 && (
              <div className="mb-4 flex gap-2">
                {detail.images.map((img, i) => (
                  <img key={i} src={img.url} alt={img.alt_text ?? ''} className="h-16 w-16 rounded object-cover" />
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit(onSavedDetail)} className="space-y-5">
              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Basics</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Name *</label>
                    <input className="input" {...register('name', { required: 'Name is required' })} />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">SKU *</label>
                    <input className="input" {...register('sku', { required: 'SKU is required' })} />
                    {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
                  </div>
                  <div>
                    <label className="label">Brand</label>
                    <input className="input" {...register('brand')} />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" {...register('status')}>
                      {['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input"
                      value={watchCategoryId}
                      onChange={(e) => {
                        setValue('category_id', e.target.value);
                        setValue('subcategory_id', '');
                      }}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Subcategory</label>
                    <select className="input" {...register('subcategory_id')} disabled={!watchCategoryId}>
                      <option value="">—</option>
                      {subcategories.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Price (base) *</label>
                    <input type="number" step="0.01" className="input" {...register('price', { required: 'Price is required' })} />
                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="label">Selling Price</label>
                    <input type="number" step="0.01" className="input" {...register('selling_price')} placeholder="auto = price" />
                  </div>
                  <div>
                    <label className="label">MRP</label>
                    <input type="number" step="0.01" className="input" {...register('mrp')} />
                  </div>
                  <div>
                    <label className="label">Cost Price</label>
                    <input type="number" step="0.01" className="input" {...register('cost_price')} />
                  </div>
                  <div>
                    <label className="label">Tax %</label>
                    <input type="number" step="0.01" className="input" {...register('tax_percent')} />
                  </div>
                  <div>
                    <label className="label">Discount %</label>
                    <input type="number" step="0.01" className="input" {...register('discount_percent')} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Logistics</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input type="number" step="0.001" className="input" {...register('weight')} />
                  </div>
                  <div>
                    <label className="label">Length (cm)</label>
                    <input type="number" step="0.01" className="input" {...register('length')} />
                  </div>
                  <div>
                    <label className="label">Width (cm)</label>
                    <input type="number" step="0.01" className="input" {...register('width')} />
                  </div>
                  <div>
                    <label className="label">Height (cm)</label>
                    <input type="number" step="0.01" className="input" {...register('height')} />
                  </div>
                  <div>
                    <label className="label">Min Stock</label>
                    <input type="number" className="input" {...register('min_stock')} />
                  </div>
                  <div>
                    <label className="label">Max Stock</label>
                    <input type="number" className="input" {...register('max_stock')} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Media</h3>
                <div className="mb-3 flex gap-2">
                  <input
                    className="input"
                    placeholder="https://…image url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <button type="button" className="btn-secondary shrink-0" onClick={addImage}>+ Add</button>
                </div>
                {images.length === 0 && <p className="text-xs text-slate-400">No images. Add at least one image URL.</p>}
                <div className="space-y-2">
                  {images.map((img, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                      {img.url && <img src={img.url} alt="" className="h-12 w-12 rounded object-cover" />}
                      <input
                        className="input flex-1"
                        placeholder="Image URL"
                        value={img.url}
                        onChange={(e) => updateImage(i, { url: e.target.value })}
                      />
                      <input
                        className="input max-w-[140px]"
                        placeholder="Alt text"
                        value={img.alt_text}
                        onChange={(e) => updateImage(i, { alt_text: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => togglePrimary(i)}
                        className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium ${img.is_primary ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {img.is_primary ? 'Primary' : 'Set primary'}
                      </button>
                      <button type="button" className="shrink-0 text-sm text-red-600 hover:underline" onClick={() => removeImage(i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Variants</h3>
                {variants.length === 0 && <p className="mb-2 text-xs text-slate-400">No variants.</p>}
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-2">
                      <input
                        className="input flex-1 basis-40"
                        placeholder="Variant SKU"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      />
                      <input
                        className="input basis-40"
                        placeholder="Name (e.g. 250g pack)"
                        value={v.name}
                        onChange={(e) => updateVariant(i, { name: e.target.value })}
                      />
                      <input
                        className="input basis-24"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(i, { price: e.target.value })}
                      />
                      <input
                        className="input basis-24"
                        placeholder="Selling"
                        value={v.selling_price}
                        onChange={(e) => updateVariant(i, { selling_price: e.target.value })}
                      />
                      <button type="button" className="shrink-0 text-sm text-red-600 hover:underline" onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-secondary mt-2" onClick={addVariant}>+ Add Variant</button>
              </section>

              <section>
                <h3 className="mb-3 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Description &amp; SEO</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Short description</label>
                    <textarea className="input" rows={2} {...register('short_description')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input" rows={3} {...register('description')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Tags (comma separated)</label>
                    <input className="input" {...register('tags')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">SEO title</label>
                    <input className="input" {...register('seo_title')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">SEO description</label>
                    <textarea className="input" rows={2} {...register('seo_description')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Attributes (JSON) — health/allergen filters</label>
                    <textarea className="input font-mono text-xs" rows={3} {...register('attributes_json')} placeholder='{"allergens":"peanuts","dietary":"vegan"}' />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}