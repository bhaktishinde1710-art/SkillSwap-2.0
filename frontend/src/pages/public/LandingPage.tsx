import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Award, 
  Cpu, 
  BrainCircuit, 
  CheckCircle2, 
  Layers,
  GraduationCap
} from 'lucide-react';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';

export const LandingPage: React.FC = () => {
  const popularSkills = [
    { name: 'Data Structures & Algorithms', category: 'Algorithms', mentors: 14, icon: '⚡' },
    { name: 'Machine Learning & PyTorch', category: 'AI & Data', mentors: 12, icon: '🧠' },
    { name: 'Full-Stack React & Node', category: 'Web Dev', mentors: 16, icon: '🌐' },
    { name: 'Cloud Computing (AWS)', category: 'DevOps', mentors: 9, icon: '☁️' },
    { name: 'Embedded Systems & IoT', category: 'Core Engg', mentors: 11, icon: '🔌' },
    { name: 'Technical Placement Prep', category: 'Career', mentors: 15, icon: '🎯' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Verify VIT Email',
      description: 'Sign up with your official college email (@vit.edu) to ensure an exclusive, trusted campus network.',
      icon: GraduationCap,
    },
    {
      step: '02',
      title: 'Set Skills & Goals',
      description: 'List the engineering technologies you can teach and specify topics you want to learn this semester.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'AI Matches You',
      description: 'Our multi-factor matching engine finds the best peer mentors based on proficiency, trust, and shared free slots.',
      icon: BrainCircuit,
    },
    {
      step: '04',
      title: 'Book & Learn',
      description: 'Schedule online or library study sessions, resolve blockers, and build your verified campus Trust Score.',
      icon: Calendar,
    },
  ];

  const faqs = [
    {
      q: 'Who can join SkillSwap?',
      a: 'Any enrolled student at Vishwakarma Institute of Technology (VIT), Pune across all academic years (FY, SY, TY, Final Year) and engineering departments can register with their @vit.edu email.',
    },
    {
      q: 'How does the AI mentor matching work?',
      a: 'The system computes an objective match percentage (0–100%) evaluating 6 key dimensions: exact skill match, proficiency compatibility, schedule overlap, mentor Trust Score, peer review ratings, and campus synergy.',
    },
    {
      q: 'What is the Trust Score and can I change it manually?',
      a: 'Trust Score is an automated, tamper-proof score (0–100) computed directly from completed sessions, peer review ratings, punctuality, low cancellation rates, and verified skills. It cannot be altered manually.',
    },
    {
      q: 'Can I be both a learner and a mentor?',
      a: 'Yes! SkillSwap embraces dual-role peer learning. You can learn Machine Learning from a final-year senior while simultaneously mentoring second-year juniors in Web Development or C++.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 lg:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-slate-50 to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-xs animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Exclusively for VIT Pune Engineering Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Learn Together. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            SkillSwap connects college students with verified peers who can teach the skills they want to learn. Master DSA, AI, Cloud, and core engineering with senior peer mentors on campus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/find-mentor"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>Find a Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all hover:border-slate-300"
            >
              Become a Mentor
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>@vit.edu Verified Community</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Multi-Factor Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Transparent Trust Scores</span>
            </div>
          </div>
        </div>
      </section>

      {/* How SkillSwap Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simple 4-Step Process</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">How SkillSwap Works</p>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            From discovering a mentor to receiving feedback, everything is built for friction-free campus collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="text-3xl font-black text-indigo-100 group-hover:text-indigo-200 transition-colors mb-3">
                  {s.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Skills */}
      <section id="popular-skills" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Campus In-Demand</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Popular Engineering Skills</p>
          </div>
          <Link
            to="/skills"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span>View All 35+ Skills</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSkills.map((sk, idx) => (
            <Link
              key={idx}
              to={`/find-mentor?skill=${encodeURIComponent(sk.name)}`}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-indigo-100 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-2xl p-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                  {sk.icon}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {sk.name}
                  </h4>
                  <span className="text-xs text-slate-500">{sk.category}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {sk.mentors} Mentors
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI-Powered Matching Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/20">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic & Explainable AI</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                No Guesswork. <br />
                Ranked Mentors with Clear Rationale.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                SkillSwap’s recommendation engine analyzes your target skill, current level, schedule constraints, and mentor reputation to produce a 0–100% score accompanied by human-readable explanations.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>35% Skill & Verification Match</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>20% Proficiency Compatibility & Practical Experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>15% Overlapping Day & Free Slot Schedule</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30% Trust Score, Peer Ratings & Campus Synergy</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/find-mentor"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-sm shadow-md transition-all"
                >
                  <span>Try AI Match Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Mock Recommendation Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 font-bold text-base flex items-center justify-center text-white">
                    AS
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Aarav Sharma</h4>
                    <p className="text-xs text-indigo-200">Fourth Year • CSE Dept</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">96%</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Match Score</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Recommended because Aarav has Expert DSA skills (3.5 yrs exp), has availability matching your Tuesday schedule, and completed 14 peer sessions with a 95% Trust Score."
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
                <span>Verified Peer Mentor</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Trust Score: 95/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Got Questions?</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Engineering Learning?
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base">
            Join fellow Vishwakarma Institute of Technology students on SkillSwap today. Free, verified, and community-driven.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-block px-8 py-3.5 bg-white text-indigo-700 font-extrabold text-sm rounded-2xl hover:bg-slate-100 shadow-lg transition-transform hover:scale-105"
            >
              Get Started with VIT College Email
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
