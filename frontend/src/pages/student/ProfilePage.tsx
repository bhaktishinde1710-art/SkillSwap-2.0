import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Award, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { userService } from '../../services/userService';
import { UserDetail } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { RatingStars } from '../../components/common/RatingStars';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.full_name}
                </h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  VIT Pune Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {profile.department} • {profile.year}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {profile.college_email}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <TrustScoreBadge score={profile.trust_score?.score || 80} size="lg" />
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors mt-2"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "{profile.bio}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Campus</span>
            <span className="font-bold text-slate-800">VIT Pune Bibwewadi</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Sessions Completed</span>
            <span className="font-bold text-slate-800">{profile.completed_sessions_count}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Average Rating</span>
            <span className="font-bold text-slate-800">{profile.average_rating ? profile.average_rating.toFixed(1) : '5.0'}★</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Role</span>
            <span className="font-bold text-indigo-600 capitalize">{profile.role} (Learner & Mentor)</span>
          </div>
        </div>
      </div>

      {/* Teaching Skills & Learning Interests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Skills I Can Teach */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">Teaching Skills ({profile.teaching_skills.length})</h2>
            </div>
            <Link to="/mentor" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {profile.teaching_skills.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No teaching skills listed yet.</p>
            ) : (
              profile.teaching_skills.map((ts) => (
                <div key={ts.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{ts.skill.name}</h4>
                    <span className="text-[10px] text-slate-400">{ts.years_of_experience} yrs practical experience</span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                    {ts.proficiency_level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900">Learning Interests ({profile.learning_interests.length})</h2>
            </div>
            <Link to="/skills" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Explore
            </Link>
          </div>

          <div className="space-y-3">
            {profile.learning_interests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No learning goals listed yet.</p>
            ) : (
              profile.learning_interests.map((li) => (
                <div key={li.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{li.skill.name}</h4>
                    <span className="text-[10px] text-slate-400">Desired: {li.desired_level}</span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px]">
                    {li.priority} Priority
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Weekly Availability Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">Weekly Availability Schedule ({profile.availabilities?.length || 0})</h2>
          </div>
          <Link to="/mentor/availability" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            Edit Availability
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {!profile.availabilities || profile.availabilities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center col-span-full">No availability slots set. Set your recurring schedule to allow peer bookings.</p>
          ) : (
            profile.availabilities.map((a) => (
              <div key={a.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">{a.day}</span>
                  <span className="text-[11px] text-slate-500">{a.start_time} – {a.end_time}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

