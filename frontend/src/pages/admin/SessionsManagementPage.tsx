import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SessionItem } from '../../types';

export const SessionsManagementPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllSessions(statusFilter);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'scheduled':
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Scheduled</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Session Audit & Logs
        </h1>
        <p className="text-xs text-slate-500">
          Review peer session interactions across all VIT engineering departments.
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Scheduled', 'Completed', 'Pending', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              statusFilter === st
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading session records...</div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No sessions match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4">Skill</th>
                  <th className="p-4">Learner</th>
                  <th className="p-4">Mentor</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Mode / Venue</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{s.skill.name}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{s.learner.full_name}</div>
                      <div className="text-[10px] text-slate-400">{s.learner.department?.split(' ')?.[0]}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-indigo-700">{s.mentor.full_name}</div>
                      <div className="text-[10px] text-slate-400">{s.mentor.department?.split(' ')?.[0]}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{s.scheduled_date}</div>
                      <div className="text-[10px] text-slate-400">{s.start_time} - {s.end_time}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {s.mode === 'Online' ? (
                        <span className="flex items-center gap-1 text-indigo-600">
                          <Video className="w-3.5 h-3.5" /> Google Meet
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <MapPin className="w-3.5 h-3.5" /> VIT Campus
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {getStatusBadge(s.status)}
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
