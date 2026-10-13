import React from 'react';
import { Sparkles, Shield, Heart, GraduationCap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SkillSwap 2.0
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Campus Peer Learning Platform built specifically for engineering students at{' '}
              <strong className="text-white font-semibold">Vishwakarma Institute of Technology (VIT), Pune</strong>.
              Connect with verified seniors and peers, master algorithms, build full-stack projects, and prepare for placements together.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Bibwewadi Campus, Pune - 411037, Maharashtra, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Campus Hub</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/skills" className="hover:text-white transition-colors">
                  Explore Engineering Skills
                </Link>
              </li>
              <li>
                <Link to="/find-mentor" className="hover:text-white transition-colors">
                  AI Mentor Matching
                </Link>
              </li>
              <li>
                <Link to="/mentor" className="hover:text-white transition-colors">
                  Become a Peer Mentor
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Peer Learning Initiative
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Departments */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">VIT Departments</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Computer Science (CSE)</li>
              <li>CSE (Artificial Intelligence)</li>
              <li>Information Technology (IT)</li>
              <li>AI & Data Science (AI&DS)</li>
              <li>Electronics & Telecomm (E&TC)</li>
              <li>Mechanical & Instrumentation</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillSwap – Campus Peer Learning Platform (VIT Pune). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" /> College Domain Verified
            </span>
            <span>Made with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> for campus coders</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
