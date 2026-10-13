import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Check, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { ReportItem } from '../../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: number, status: string) => {
    try {
      await adminService.updateReportStatus(reportId, status);
      fetchReports();
    } catch (err) {
      console.error('Failed to update report status:', err);
      alert('Could not update report status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Feedback & Incident Reports
        </h1>
        <p className="text-xs text-slate-500">
          Review tickets regarding scheduling disagreements, behavior, or general assistance.
        </p>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No reports on file. The community is clean!</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((rep) => (
              <div key={rep.id} className="p-6 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rep.reason}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'resolved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : rep.status === 'investigating'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Filed on {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{rep.description}"
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 pt-1">
                  <div>
                    Reporter: <strong className="text-slate-700">{rep.reporter.full_name}</strong> • Reported:{' '}
                    <strong className="text-slate-700">{rep.reported_user.full_name}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status !== 'investigating' && rep.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'investigating')}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs"
                      >
                        Investigate
                      </button>
                    )}
                    {rep.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {rep.status !== 'dismissed' && (
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                        className="px-3 py-1 text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
