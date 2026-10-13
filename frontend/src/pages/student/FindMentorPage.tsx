import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  BrainCircuit, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ArrowRight,
  User,
  ShieldCheck,
  Star
} from 'lucide-react';
import { skillService } from '../../services/skillService';
import { matchingService } from '../../services/matchingService';
import { Skill, MentorRecommendation } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const FindMentorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSkillName = searchParams.get('skill') || '';

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [desiredLevel, setDesiredLevel] = useState('Intermediate');
  const [preferredMode, setPreferredMode] = useState('Any');
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState('Any');

  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await skillService.getSkills();
        setSkills(data);
        if (data.length > 0) {
          if (initialSkillName) {
            const matched = data.find(s => s.name.toLowerCase() === initialSkillName.toLowerCase());
            if (matched) {
              setSelectedSkillId(matched.id);
              triggerSearch(matched.id);
              return;
            }
          }
          // Default to first skill (DSA or Python)
          const defSkill = data.find(s => s.name.includes('DSA')) || data[0];
          setSelectedSkillId(defSkill.id);
          triggerSearch(defSkill.id);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    };
    fetchSkills();
  }, [initialSkillName]);

  const triggerSearch = async (skillId: number) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await matchingService.recommendMentors({
        skill_id: skillId,
        current_level: currentLevel,
        desired_level: desiredLevel,
        preferred_mode: preferredMode,
        preferred_days: preferredDays,
        preferred_time: preferredTime !== 'Any' ? preferredTime : undefined
      });
      setRecommendations(results);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkillId) {
      triggerSearch(selectedSkillId);
    }
  };

  const toggleDay = (day: string) => {
    setPreferredDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
          <span>Deterministic AI Multi-Criteria Matching</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find My Mentor
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Specify what you want to learn, your desired mastery level, and preferred schedule. Our campus matching algorithm finds the best peer mentors at VIT Pune.
        </p>
      </div>

      {/* Query Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Skill Selector */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Skill to Learn
              </label>
              <select
                value={selectedSkillId || ''}
                onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            {/* Current Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Your Current Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Beginner">Beginner (Starting from scratch)</option>
                <option value="Intermediate">Intermediate (Know the syntax & basics)</option>
                <option value="Advanced">Advanced (Need deep dive & optimization)</option>
              </select>
            </div>

            {/* Desired Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Desired Mastery Level
              </label>
              <select
                value={desiredLevel}
                onChange={(e) => setDesiredLevel(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Intermediate">Intermediate (Project ready)</option>
                <option value="Advanced">Advanced (Campus placement ready)</option>
                <option value="Expert">Expert (Contest / production grade)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Preferred Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Mode
              </label>
              <div className="flex gap-2">
                {['Any', 'Online', 'Offline'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreferredMode(m)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      preferredMode === m
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {m === 'Any' ? 'Flexible (Any)' : m === 'Online' ? 'Google Meet' : 'VIT Campus'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Days (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysList.map((day) => {
                  const active = preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {day.slice(0, 3)} {active && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Mentors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find Best Mentors</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recommendations Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Ranked Mentor Recommendations ({recommendations.length})
          </h2>
          <span className="text-xs text-slate-500">
            Sorted by AI match score (Skill, Proficiency, Trust, Rating)
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Running matching algorithm across VIT student mentors...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Mentors Found for this Combination</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try selecting another engineering skill, or choose 'Flexible (Any)' mode and days to see available mentors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                        {rec.mentor.first_name[0]}{rec.mentor.last_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{rec.mentor.full_name}</h3>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            VIT Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {rec.mentor.department} • {rec.mentor.year}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Gauge */}
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {Math.round(rec.match_score)}%
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AI Match</p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                      {rec.matched_skill.name} ({rec.proficiency_level})
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg">
                      {rec.years_of_experience} yrs exp
                    </span>
                    <TrustScoreBadge score={rec.trust_score} size="sm" />
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rec.average_rating.toFixed(1)}</span>
                      <span className="text-[10px] text-amber-600/70 font-normal">({rec.completed_sessions} completed)</span>
                    </div>
                  </div>

                  {/* Why Matched explanation */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100/80">
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{rec.explanation}"
                    </p>
                  </div>

                  {/* Available Days */}
                  {rec.available_days && rec.available_days.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Available: {rec.available_days.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/mentors/${rec.mentor.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    View Full Profile & Reviews
                  </Link>

                  <Link
                    to={`/mentors/${rec.mentor.id}?bookSkill=${rec.matched_skill.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>Request Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
