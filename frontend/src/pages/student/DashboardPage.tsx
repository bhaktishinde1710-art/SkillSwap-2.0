import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight, 
  Video, 
  BookOpen, 
  AlertCircle,
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { sessionService } from '../../services/sessionService';
import { matchingService } from '../../services/matchingService';
import { UserDetail, SessionItem, MentorRecommendation } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionItem[]>([]);
  const [pendingSessions, setPendingSessions] = useState<SessionItem[]>([]);
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [profData, sessData, recData] = await Promise.all([
          userService.getProfile(),
          sessionService.getSessions('all'),
          matchingService.getDashboardRecommendations()
        ]);

        setProfile(profData);
        setUpcomingSessions(sessData.filter(s => s.status === 'Scheduled' || s.status === 'Accepted'));
        setPendingSessions(sessData.filter(s => s.status === 'Pending'));
        setRecommendations(recData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading your campus learning hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Profile Status Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                VIT Pune Campus
              </span>
              <span className="text-xs text-slate-300">{profile?.department} • {profile?.year}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Connect with peer mentors for placement prep, lab projects, and algorithm doubts.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Your Trust Score</p>
              <p className="text-2xl font-black text-emerald-400">
                {profile?.trust_score?.score ? Math.round(profile.trust_score.score) : 80}/100
              </p>
              <p className="text-[10px] text-indigo-200">Verified Peer Reputation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <p className="text-2xl font-extrabold text-slate-900">{profile?.completed_sessions_count || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Peer peer sessions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Sessions</span>
          <p className="text-2xl font-extrabold text-indigo-600">{upcomingSessions.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Scheduled this week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</span>
          <p className="text-2xl font-extrabold text-amber-500">{pendingSessions.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Awaiting confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-extrabold text-slate-900">
              {profile?.average_rating ? profile.average_rating.toFixed(1) : '5.0'}
            </p>
            <RatingStars rating={profile?.average_rating || 5.0} size="sm" />
          </div>
          <span className="text-[11px] text-slate-400">{profile?.total_reviews_count || 0} reviews</span>
        </div>
      </div>

      {/* AI Recommended Mentors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Recommended Mentors for You</h2>
              <p className="text-xs text-slate-500">Based on your learning interests and schedule</p>
            </div>
          </div>

          <Link
            to="/find-mentor"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Custom Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.length === 0 ? (
            <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-3">
              <p className="text-sm text-slate-500">
                Add learning interests to receive tailored peer mentor recommendations.
              </p>
              <Link
                to="/find-mentor"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Find Mentors by Skill
              </Link>
            </div>
          ) : (
            recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center">
                        {rec.mentor.first_name[0]}{rec.mentor.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rec.mentor.full_name}</h4>
                        <p className="text-[11px] text-slate-500">{rec.mentor.department?.split(' ')?.[0]} • {rec.mentor.year}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      {Math.round(rec.match_score)}% Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {rec.matched_skill.name} ({rec.proficiency_level})
                    </span>
                    <TrustScoreBadge score={rec.trust_score} size="sm" showLabel={false} />
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 leading-relaxed line-clamp-2">
                    "{rec.explanation}"
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
                  <Link
                    to={`/mentors/${rec.mentor.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/mentors/${rec.mentor.id}?bookSkill=${rec.matched_skill.id}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming & Pending Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Upcoming Sessions</h3>
            </div>
            <Link to="/sessions" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No sessions scheduled for this week.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{s.skill.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      With {s.learner_id === user?.id ? s.mentor.full_name : s.learner.full_name} • {s.scheduled_date} ({s.start_time} - {s.end_time})
                    </p>
                  </div>
                  {s.meeting_link && (
                    <a
                      href={s.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" /> Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Pending Session Requests</h3>
            </div>
            <Link to="/sessions" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage
            </Link>
          </div>

          {pendingSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No pending requests at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{s.skill.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Requested with {s.mentor.full_name} for {s.scheduled_date} at {s.start_time}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Awaiting
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
