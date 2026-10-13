import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Cpu, Sliders, CheckCircle2, GraduationCap, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Settings & Campus Policies
          </h1>
          <p className="text-xs text-slate-500">
            Platform governance, institutional domain verification, and AI matching parameters.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Configuration</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-sm">
          Loading platform settings...
        </div>
      ) : settings ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institutional Configuration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Institutional College Authority</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Campus Institution:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{settings.default_college}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Platform Name & Version:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{settings.project_name} v{settings.version}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Authorized College Email Domain:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {settings.allowed_email_domains?.map((dom: string) => (
                    <span key={dom} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      @{dom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-800 leading-relaxed text-[11px]">
                <p className="font-bold">Security Guarantee:</p>
                <p className="mt-0.5">
                  Only students with active, validated @vit.edu email addresses can authenticate and register. Unverified or external domains are immediately rejected by backend security policies.
                </p>
              </div>
            </div>
          </div>

          {/* AI Matching Algorithm Hyperparameters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">AI Matching Engine Weights</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-dimensional scoring factors used by the backend recommender to compute match percentage (0–100%):
            </p>

            <div className="space-y-3 text-xs">
              {Object.entries(settings.algorithm_weights || {}).map(([key, weight]: [string, any]) => {
                const percent = Math.round(weight * 100);
                const labelMap: Record<string, string> = {
                  skill_match: 'Exact Skill & Topic Alignment',
                  proficiency: 'Proficiency Compatibility',
                  availability: 'Time & Slot Overlap',
                  trust_score: 'Mentor Verified Trust Score',
                  rating: 'Historical Peer Rating',
                  preferences: 'Department & Academic Synergy'
                };
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{labelMap[key] || key}</span>
                      <span className="text-purple-700 font-extrabold">{percent}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Score Algorithm Policies */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Trust Score Dynamic Weight Breakdown</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-2xl font-black text-indigo-600">35%</span>
                <h4 className="font-bold text-slate-800">Teaching Quality</h4>
                <p className="text-[11px] text-slate-500">Averaged peer rating from verified learning sessions.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-2xl font-black text-emerald-600">25%</span>
                <h4 className="font-bold text-slate-800">Session Completion</h4>
                <p className="text-[11px] text-slate-500">Rate of successfully delivered vs cancelled sessions.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-2xl font-black text-purple-600">25%</span>
                <h4 className="font-bold text-slate-800">Reliability & Promptness</h4>
                <p className="text-[11px] text-slate-500">Acceptance promptness and low rescheduling rate.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-2xl font-black text-amber-600">15%</span>
                <h4 className="font-bold text-slate-800">Volume & Verified Skills</h4>
                <p className="text-[11px] text-slate-500">Total sessions taught and faculty/peer skill endorsements.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
