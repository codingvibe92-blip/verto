import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CatalogService, Category, Subcategory } from '../../services/catalog';
import Spinner from '../../components/Spinner';

export default function Categories() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; status: string }>();

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
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

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

  const startEdit = (c: Category) => {
    setEditing(c);
    reset({ name: c.name, status: c.status });
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
      if (activeCategory) await loadSubs(activeCategory.id);
    } catch (err) {
      setError(CatalogService.errorMessage(err));
    }
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
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
        await CatalogService.updateSubcategory(editingSub.id, { ...values, category_id: activeCategory.id });
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
    <div>
      <h1 className="mb-6 text-xl font-semibold">Categories &amp; Subcategories</h1>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              {editing ? `Edit: ${editing.name}` : 'New category'}
            </h2>
            {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">{editing ? 'Save' : 'Create'}</button>
                {editing && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setEditing(null); reset({ name: '', status: 'ACTIVE' }); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Slug</th>
                  <th className="th">Status</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((c) => (
                  <tr key={c.id} className={activeCategory?.id === c.id ? 'bg-brand-50' : ''}>
                    <td className="td font-medium text-slate-800">
                      <button className="hover:underline" onClick={() => selectCategory(c)}>{c.name}</button>
                    </td>
                    <td className="td text-slate-500">{c.slug}</td>
                    <td className="td">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button className="text-sm text-brand-600 hover:underline" onClick={() => startEdit(c)}>Edit</button>
                        <button className="text-sm text-red-600 hover:underline" onClick={() => remove(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={4} className="td py-10 text-center text-slate-400">No categories</td></tr>
                )}
              </tbody>
            </table>
            {loading && <Spinner />}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">
            {activeCategory ? `Subcategories of ${activeCategory.name}` : 'Subcategories'}
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            {activeCategory ? 'Add, edit or remove subcategories below.' : 'Click a category name to manage its subcategories.'}
          </p>

          {subsError && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{subsError}</div>}

          {activeCategory && (
            <>
              <form onSubmit={subForm.handleSubmit(onSubSubmit)} className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    {...subForm.register('name', { required: 'Name is required' })}
                    placeholder={editingSub ? '' : 'e.g. Chips & Crisps'}
                  />
                  {subForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-600">{subForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" {...subForm.register('status')}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className="btn-primary">{editingSub ? 'Save Subcategory' : '+ Add Subcategory'}</button>
                  {editingSub && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => { setEditingSub(null); subForm.reset({ name: '', status: 'ACTIVE' }); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="th">Name</th>
                      <th className="th">Slug</th>
                      <th className="th">Status</th>
                      <th className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subs.map((s) => (
                      <tr key={s.id}>
                        <td className="td font-medium text-slate-800">{s.name}</td>
                        <td className="td text-slate-500">{s.slug}</td>
                        <td className="td">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="td">
                          <div className="flex gap-2">
                            <button className="text-sm text-brand-600 hover:underline" onClick={() => startEditSub(s)}>Edit</button>
                            <button className="text-sm text-red-600 hover:underline" onClick={() => removeSub(s)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!subsLoading && subs.length === 0 && (
                      <tr><td colSpan={4} className="td py-8 text-center text-slate-400">No subcategories</td></tr>
                    )}
                  </tbody>
                </table>
                {subsLoading && <Spinner />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}