import React from 'react';
import { Sparkles, ShieldCheck, Users, Target, Heart, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Peer Learning Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About SkillSwap 2.0
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          SkillSwap is an AI-powered campus peer learning ecosystem developed to bridge the knowledge gap between academic curriculum and high-demand engineering skills at{' '}
          <strong className="text-slate-900 font-semibold">Vishwakarma Institute of Technology (VIT), Pune</strong>.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Peer-to-Peer Mentoring</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Learning from a senior who cracked campus placements or built live open-source software is 10x more effective than passive video lectures.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Verified Trust Scores</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Accountability and safety are built into our platform. Trust Scores reflect genuine session completions, attendee feedback, and verified teaching skills.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">AI-Assisted Synergy</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            No more hunting through WhatsApp groups. Our algorithmic recommendation matches learning goals, schedule overlap, and proficiency tiers.
          </p>
        </div>
      </div>

      {/* College Info Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Campus Context</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Vishwakarma Institute of Technology, Pune
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          VIT Pune is an autonomous engineering institution known for top-tier academic excellence and active student engineering teams. SkillSwap serves as a dedicated digital corridor for technical skill exchange, semester project pairing, coding interview dry runs, and multidisciplinary hardware-software collaboration.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          Join SkillSwap with Your VIT Email
        </Link>
      </div>
    </div>
  );
};
