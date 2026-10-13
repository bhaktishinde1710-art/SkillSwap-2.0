import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  ChevronLeft,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../common/Navbar';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md p-6 bg-white rounded-2xl shadow-xl text-center border border-rose-100">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Admin Privileges Required</h2>
          <p className="text-sm text-slate-500 mt-2">
            You must be logged in with a campus administrator account to view the SkillSwap admin suite.
          </p>
          <Link
            to="/dashboard"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Skills Catalog', path: '/admin/skills', icon: BookOpen },
    { label: 'Session Auditing', path: '/admin/sessions', icon: Calendar },
    { label: 'Peer Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Student Reports', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Campus Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 sticky top-24 space-y-1">
            <div className="px-3 py-2 mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Admin Control</h3>
                <p className="text-[11px] text-slate-500">VIT Pune Oversight</p>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-purple-50 text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Student View</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Admin Main View */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
