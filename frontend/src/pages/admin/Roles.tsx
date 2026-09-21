import { useEffect, useState } from 'react';
import { AdminUserService, Role, Permission } from '../../services/adminUsers';
import Spinner from '../../components/Spinner';
import {
  FiShield,
  FiPlus,
  FiCheck,
  FiX,
  FiLock,
  FiLayers,
  FiSave,
} from 'react-icons/fi';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create role modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ name: '', slug: '', description: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesData, permsData] = await Promise.all([
        AdminUserService.listRoles(),
        AdminUserService.listPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);

      if (rolesData.length > 0 && selectedRoleId === null) {
        setSelectedRoleId(rolesData[0].id);
        setSelectedPermIds(rolesData[0].permissions.map((p) => p.id));
      } else if (selectedRoleId !== null) {
        const current = rolesData.find((r) => r.id === selectedRoleId);
        if (current) {
          setSelectedPermIds(current.permissions.map((p) => p.id));
        }
      }
    } catch (err) {
      setError(AdminUserService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id);
    setSelectedPermIds(role.permissions.map((p) => p.id));
    setError('');
    setSuccessMsg('');
  };

  const togglePermission = (permId: number) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (groupName: string | null, select: boolean) => {
    const groupPerms = permissions.filter((p) => p.permission_group === groupName).map((p) => p.id);
    if (select) {
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...groupPerms])));
    } else {
      setSelectedPermIds((prev) => prev.filter((id) => !groupPerms.includes(id)));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setError('');
    try {
      await AdminUserService.updateRolePermissions(selectedRoleId, selectedPermIds);
      setSuccessMsg('Role permissions updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadData();
    } catch (err) {
      setError(AdminUserService.errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleData.name || !newRoleData.slug) {
      setError('Role name and slug are required');
      return;
    }
    setSaving(true);
    try {
      const created = await AdminUserService.createRole(newRoleData);
      setShowCreateModal(false);
      setNewRoleData({ name: '', slug: '', description: '' });
      setSuccessMsg(`Role ${created.name} created successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadData();
      setSelectedRoleId(created.id);
      setSelectedPermIds([]);
    } catch (err) {
      setError(AdminUserService.errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by permission_group
  const permissionGroups = permissions.reduce((acc, p) => {
    const g = p.permission_group || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiShield className="text-emerald-600" /> Roles & Permissions Matrix
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure system roles and grant granular capabilities across ERP modules.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <FiX />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FiCheck className="text-emerald-600" /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <FiX />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Spinner />
          <p className="text-gray-500 text-sm mt-3">Loading roles and permissions matrix...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Select Role ({roles.length})
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {roles.map((r) => {
                const isSelected = r.id === selectedRoleId;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left p-4 transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isSelected ? 'text-emerald-900 font-semibold' : 'text-gray-800'}`}>
                          {r.name}
                        </span>
                        {r.is_system ? (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">
                            System
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{r.slug}</p>
                      {r.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                      {r.permissions.length} perms
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix Content */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedRole ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{selectedRole.name}</h2>
                      <span className="text-xs text-gray-500">({selectedRole.slug})</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedRole.description || 'Configuring granted permissions for this role.'}
                    </p>
                  </div>

                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>

                {/* Permission Groups */}
                <div className="mt-6 space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(permissionGroups).map(([group, perms]) => {
                    return (
                      <div key={group} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <FiLayers className="text-emerald-600 w-4 h-4" />
                            <span className="font-semibold text-gray-800 text-sm capitalize">
                              {group} Module
                            </span>
                            <span className="text-xs text-gray-400">
                              ({perms.filter((p) => selectedPermIds.includes(p.id)).length}/{perms.length})
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleGroup(group === 'General' ? null : group, true)}
                              className="text-[11px] text-emerald-600 hover:underline font-medium"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={() => toggleGroup(group === 'General' ? null : group, false)}
                              className="text-[11px] text-gray-500 hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {perms.map((p) => {
                            const isChecked = selectedPermIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-white border-emerald-500 shadow-xs'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(p.id)}
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                  <span className="font-medium text-gray-900 block">{p.name}</span>
                                  {p.description && (
                                    <span className="text-gray-400 text-[11px] line-clamp-1">
                                      {p.description}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <FiLock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Select a role on the left to configure permissions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <FiPlus className="text-emerald-600" /> Create Custom Role
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Auditor"
                  value={newRoleData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setNewRoleData({ ...newRoleData, name, slug });
                  }}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Role Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="quality-auditor"
                  value={newRoleData.slug}
                  onChange={(e) => setNewRoleData({ ...newRoleData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and scope for this role..."
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
