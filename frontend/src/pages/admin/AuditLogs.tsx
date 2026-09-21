import { useEffect, useState } from 'react';
import { AuditLogService, AuditLog } from '../../services/auditLogs';
import Spinner from '../../components/Spinner';
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiUser,
  FiGlobe,
  FiX,
  FiClock,
} from 'react-icons/fi';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // Inspection modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AuditLogService.list({
        page,
        limit: 25,
        search: search || undefined,
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
      });
      setLogs(res.rows);
      setTotalPages(res.meta.totalPages || res.meta.pages || 1);
      setTotalCount(res.meta.total);
    } catch (err) {
      setError(AuditLogService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, actionFilter, entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiFileText className="text-emerald-600" /> System Audit Trail
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Immutable forensic log of administrative operations, stock mutations, and security events.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by action, entity, user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Entities</option>
            <option value="order">Orders</option>
            <option value="product">Products</option>
            <option value="inventory">Inventory</option>
            <option value="production">Production</option>
            <option value="user">Users</option>
            <option value="settings">Settings</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Spinner />
            <p className="text-gray-500 text-sm mt-3">Loading audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FiFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No audit records found</p>
            <p className="text-sm mt-1">Actions performed across the ERP will be recorded here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-gray-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {log.user_name ? (
                        <div>
                          <p className="font-medium text-gray-900 text-xs flex items-center gap-1">
                            <FiUser className="text-gray-400 w-3 h-3" /> {log.user_name}
                          </p>
                          <p className="text-[11px] text-gray-400">{log.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">System Automation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        log.action.includes('CREATE')
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action.includes('DELETE')
                          ? 'bg-red-100 text-red-800'
                          : log.action.includes('UPDATE') || log.action.includes('CHANGE')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-800 uppercase">{log.entity}</span>
                        {log.entity_id && (
                          <span className="text-gray-400 ml-1 font-mono">#{log.entity_id}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                      {log.ip_address ? (
                        <span className="flex items-center gap-1">
                          <FiGlobe className="w-3 h-3" /> {log.ip_address}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="View Change Payload"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {logs.length} of {totalCount} logs
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <FiFileText className="text-emerald-600" /> Audit Record #{selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Actor</span>
                  <span className="font-semibold text-gray-800">
                    {selectedLog.user_name || 'System Automation'} ({selectedLog.user_email || 'internal'})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Timestamp</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Action & Entity</span>
                  <span className="font-semibold text-gray-800">
                    {selectedLog.action} on {selectedLog.entity} #{selectedLog.entity_id || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Origin IP</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {selectedLog.ip_address || 'Localhost / Internal'}
                  </span>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div className="text-xs">
                  <span className="text-gray-400 block font-medium uppercase mb-1">User Agent</span>
                  <p className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 font-mono text-[11px] break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {/* Old vs New Value JSON */}
              <div className="space-y-3">
                {selectedLog.old_value && (
                  <div>
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block mb-1">
                      Previous State (Old Value)
                    </span>
                    <pre className="p-3 bg-red-50/50 border border-red-200 rounded-lg text-xs font-mono text-red-900 overflow-x-auto max-h-48">
                      {typeof selectedLog.old_value === 'string'
                        ? selectedLog.old_value
                        : JSON.stringify(selectedLog.old_value, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_value && (
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                      Mutated State (New Value)
                    </span>
                    <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 overflow-x-auto max-h-48">
                      {typeof selectedLog.new_value === 'string'
                        ? selectedLog.new_value
                        : JSON.stringify(selectedLog.new_value, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
