import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { skillService } from '../../services/skillService';
import { userService } from '../../services/userService';
import { Skill, UserDetail } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const SkillDiscoveryPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState<UserDetail[]>([]);
  const [viewMode, setViewMode] = useState<'skills' | 'mentors'>('skills');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [skillsData, catsData, mentorsData] = await Promise.all([
          skillService.getSkills(),
          skillService.getCategories(),
          userService.getMentors()
        ]);
        setSkills(skillsData);
        setCategories(['All', ...catsData]);
        setMentors(mentorsData);
      } catch (err) {
        console.error('Failed to load discovery data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSkills = skills.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredMentors = mentors.filter((m) => {
    const matchSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.teaching_skills.some(ts => ts.skill.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'All' || 
                     m.teaching_skills.some(ts => ts.skill.category === selectedCategory);
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase border border-indigo-200">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>VIT Pune Engineering Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Skill & Mentor Discovery
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Browse campus skills across algorithms, full-stack, cloud, machine learning, and core electronics.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setViewMode('skills')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'skills' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skills Directory ({filteredSkills.length})
          </button>
          <button
            onClick={() => setViewMode('mentors')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'mentors' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peer Mentors ({filteredMentors.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={viewMode === 'skills' ? "Search skills by name (e.g. DSA, React, PyTorch, AWS)..." : "Search mentors by name, department, or skill..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading catalog...</p>
        </div>
      ) : viewMode === 'skills' ? (
        /* Skills Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((sk) => {
            const skillMentors = mentors.filter(m => m.teaching_skills.some(ts => ts.skill_id === sk.id));
            return (
              <div
                key={sk.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {sk.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {skillMentors.length} mentors
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{sk.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {sk.description || 'Core engineering and software development skill.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/find-mentor?skill=${encodeURIComponent(sk.name)}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Match with Mentors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => {
                      setSearchQuery(sk.name);
                      setViewMode('mentors');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    View Teachers
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mentors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold text-base flex items-center justify-center">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{m.full_name}</h3>
                      <p className="text-xs text-slate-500">{m.department?.split(' ')?.[0]} • {m.year}</p>
                    </div>
                  </div>
                  <TrustScoreBadge score={m.trust_score?.score || 80} size="sm" showLabel={false} />
                </div>

                {m.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                    "{m.bio}"
                  </p>
                )}

                {/* Teaching Skills Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.teaching_skills.slice(0, 3).map((ts) => (
                    <span key={ts.id} className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                      {ts.skill.name} ({ts.proficiency_level})
                    </span>
                  ))}
                  {m.teaching_skills.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{m.teaching_skills.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <RatingStars rating={m.average_rating || 5.0} size="sm" />
                    <span>{m.average_rating ? m.average_rating.toFixed(1) : '5.0'}</span>
                  </div>
                  <span>{m.completed_sessions_count} sessions</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/mentors/${m.id}`}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  View Profile
                </Link>
                <Link
                  to={`/mentors/${m.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Request Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
