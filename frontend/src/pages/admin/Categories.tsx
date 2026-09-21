import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CatalogService, Category, Subcategory } from '../../services/catalog';
import Spinner from '../../components/Spinner';
import {
  FiEdit2,
  FiTrash2,
  FiChevronRight,
  FiFolder,
  FiFolderPlus,
  FiAlertCircle,
} from 'react-icons/fi';

export default function Categories() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; status: string }>();

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState('');
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const subForm = useForm<{ name: string; status: string }>();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await CatalogService.listCategories({ limit: 100 });
      setRows(data.rows);
      if (data.rows.length > 0 && !activeCategory) {
        selectCategory(data.rows[0]);
      }
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  const loadSubs = useCallback(async (categoryId: number) => {
    setSubsLoading(true);
    setSubsError('');
    try {
      const data = await CatalogService.listSubcategories({ category_id: categoryId, limit: 100 });
      setSubs(data.rows);
    } catch (err) {
      setSubsError(CatalogService.errorMessage(err));
    } finally {
      setSubsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectCategory = (c: Category) => {
    setActiveCategory(c);
    setEditingSub(null);
    subForm.reset({ name: '', status: 'ACTIVE' });
    loadSubs(c.id);
  };

  const onSubmit = async (values: { name: string; status: string }) => {
    setError('');
    try {
      if (editing) {
        await CatalogService.updateCategory(editing.id, values);
      } else {
        await CatalogService.createCategory(values);
      }
      setEditing(null);
      reset({ name: '', status: 'ACTIVE' });
      await load();
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    }
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    reset({ name: c.name, status: c.status });
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}" and associated classifications?`)) return;
    try {
      await CatalogService.deleteCategory(c.id);
      if (activeCategory?.id === c.id) {
        setActiveCategory(null);
        setSubs([]);
      }
      await load();
    } catch (err) {
      window.alert(CatalogService.errorMessage(err));
    }
  };

  const onSubSubmit = async (values: { name: string; status: string }) => {
    if (!activeCategory) return;
    setSubsError('');
    try {
      if (editingSub) {
        await CatalogService.updateSubcategory(editingSub.id, values);
      } else {
        await CatalogService.createSubcategory({ category_id: activeCategory.id, ...values });
      }
      setEditingSub(null);
      subForm.reset({ name: '', status: 'ACTIVE' });
      await loadSubs(activeCategory.id);
    } catch (err) {
      setSubsError(CatalogService.errorMessage(err));
    }
  };

  const startEditSub = (s: Subcategory) => {
    setEditingSub(s);
    subForm.reset({ name: s.name, status: s.status });
  };

  const removeSub = async (s: Subcategory) => {
    if (!window.confirm(`Delete subcategory "${s.name}"?`)) return;
    try {
      await CatalogService.deleteSubcategory(s.id);
      if (activeCategory) await loadSubs(activeCategory.id);
    } catch (err) {
      window.alert(CatalogService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Categories & Taxonomies
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              {rows.length} categories
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Structure your storefront navigation hierarchy, departmental groupings, and catalog filters.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Categories List & Create/Edit Form */}
        <div className="space-y-6">
          {/* Create/Edit Category Form */}
          <div className="card p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <FiFolderPlus className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                {editing ? `Edit Category: ${editing.name}` : 'Create Category'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Category Name</label>
                <input
                  className="input"
                  placeholder="e.g. Health & Wellness"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Display Status</label>
                <select className="input cursor-pointer" {...register('status')}>
                  <option value="ACTIVE">ACTIVE (Published on Storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="btn-primary btn-sm">
                  {editing ? 'Save Category' : '+ Add Category'}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(null);
                      reset({ name: '', status: 'ACTIVE' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories Table Card */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Primary Categories ({rows.length})
              </span>
              <span className="text-[11px] text-slate-400">Select to view subcategories</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="th">Category Name</th>
                    <th className="th">Slug</th>
                    <th className="th">Status</th>
                    <th className="th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((c) => {
                    const isSelected = activeCategory?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/70'
                        }`}
                        onClick={() => selectCategory(c)}
                      >
                        <td className="td font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <FiFolder className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span>{c.name}</span>
                            {isSelected && <FiChevronRight className="h-3.5 w-3.5 text-blue-600 ml-auto" />}
                          </div>
                        </td>
                        <td className="td text-xs font-mono text-slate-500">{c.slug}</td>
                        <td className="td">
                          <span
                            className={`badge ${
                              c.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span>{c.status}</span>
                          </span>
                        </td>
                        <td className="td text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => startEdit(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit Category"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Category"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="td py-10 text-center text-slate-400">
                        No categories found. Create one above to organize products.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {loading && (
              <div className="py-6">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Subcategories Master Panel */}
        <div className="card p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              {activeCategory ? `Subcategories of "${activeCategory.name}"` : 'Subcategories'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeCategory
                ? 'Granular product types and taxonomy filters for this category.'
                : 'Click any category on the left to inspect and create its subcategories.'}
            </p>
          </div>

          {subsError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              {subsError}
            </div>
          )}

          {activeCategory && (
            <div className="space-y-5">
              {/* Add / Edit Subcategory Form */}
              <form onSubmit={subForm.handleSubmit(onSubSubmit)} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {editingSub ? `Edit Subcategory: ${editingSub.name}` : '+ Add New Subcategory'}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Subcategory Name</label>
                    <input
                      className="input"
                      placeholder="e.g. Roasted Chips"
                      {...subForm.register('name', { required: 'Name is required' })}
                    />
                    {subForm.formState.errors.name && (
                      <p className="mt-1 text-xs text-rose-600">
                        {subForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input cursor-pointer" {...subForm.register('status')}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" className="btn-primary btn-sm">
                    {editingSub ? 'Save Subcategory' : 'Add Subcategory'}
                  </button>
                  {editingSub && (
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        setEditingSub(null);
                        subForm.reset({ name: '', status: 'ACTIVE' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Subcategories Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="th">Subcategory Name</th>
                      <th className="th">Slug</th>
                      <th className="th">Status</th>
                      <th className="th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subs.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="td font-medium text-slate-800">{s.name}</td>
                        <td className="td text-xs font-mono text-slate-500">{s.slug}</td>
                        <td className="td">
                          <span
                            className={`badge ${
                              s.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            <span>{s.status}</span>
                          </span>
                        </td>
                        <td className="td text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => startEditSub(s)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit Subcategory"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeSub(s)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Subcategory"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!subsLoading && subs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="td py-8 text-center text-slate-400">
                          No subcategories under "{activeCategory.name}". Add one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {subsLoading && (
                  <div className="py-6">
                    <Spinner />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}