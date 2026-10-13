import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  Ban, 
  UserCheck, 
  Filter
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { UserDetail } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search: search || undefined,
        status_filter: statusFilter || undefined
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusAction = async (userId: number, action: 'verify' | 'suspend' | 'activate' | 'reject') => {
    try {
      await adminService.updateUserStatus(userId, action);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update user status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Moderation
          </h1>
          <p className="text-xs text-slate-500">
            Audit student profiles, verify campus credentials, and manage suspensions.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or @vit.edu email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
            <option value="suspended">Suspended Accounts</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading user records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Department & Year</th>
                  <th className="p-4">Trust Score</th>
                  <th className="p-4">Sessions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.college_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div>{u.department}</div>
                      <div className="text-[11px] text-slate-400">{u.year}</div>
                    </td>

                    <td className="p-4">
                      <TrustScoreBadge score={u.trust_score?.score || 80} size="sm" showLabel={false} />
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {u.completed_sessions_count} completed
                    </td>

                    <td className="p-4">
                      {u.verification_status === 'verified' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      )}
                      {u.verification_status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {u.verification_status === 'suspended' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Suspended
                        </span>
                      )}
                      {u.verification_status === 'rejected' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleStatusAction(u.id, 'verify')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Verify Student"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {u.verification_status === 'pending' && (
                          <button
                            onClick={() => handleStatusAction(u.id, 'reject')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Reject Verification"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {u.verification_status !== 'suspended' && u.role !== 'admin' && (
                          <button
                            onClick={() => handleStatusAction(u.id, 'suspend')}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {u.verification_status === 'suspended' && (
                          <button
                            onClick={() => handleStatusAction(u.id, 'activate')}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Activate User"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
