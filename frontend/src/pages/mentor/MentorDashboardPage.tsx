import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Award, 
  ShieldCheck, 
  AlertCircle,
  Video
} from 'lucide-react';
import { userService } from '../../services/userService';
import { sessionService } from '../../services/sessionService';
import { skillService } from '../../services/skillService';
import { UserDetail, SessionItem, Skill } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { Modal } from '../../components/common/Modal';

export const MentorDashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [pendingRequests, setPendingRequests] = useState<SessionItem[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Skill Modal
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillId, setNewSkillId] = useState<number | null>(null);
  const [newProficiency, setNewProficiency] = useState('Intermediate');
  const [newExperience, setNewExperience] = useState(1.5);
  const [addingSkill, setAddingSkill] = useState(false);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const [profData, requestsData, skillsData] = await Promise.all([
        userService.getProfile(),
        sessionService.getMentorRequests(),
        skillService.getSkills()
      ]);
      setProfile(profData);
      setPendingRequests(requestsData);
      setAllSkills(skillsData);
      if (skillsData.length > 0 && !newSkillId) {
        setNewSkillId(skillsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load mentor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const handleRequestResponse = async (sessionId: number, status: 'Accepted' | 'Rejected') => {
    try {
      await sessionService.updateSessionStatus(sessionId, { status });
      fetchMentorData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update request.');
    }
  };

  const handleAddTeachingSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillId) return;
    setAddingSkill(true);
    try {
      await skillService.addTeachingSkill({
        skill_id: newSkillId,
        proficiency_level: newProficiency,
        years_of_experience: newExperience
      });
      setIsAddSkillOpen(false);
      fetchMentorData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add teaching skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (userSkillId: number) => {
    if (confirm('Are you sure you want to remove this teaching skill?')) {
      try {
        await skillService.removeTeachingSkill(userSkillId);
        fetchMentorData();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to remove skill.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading mentor hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Mentor Hub
            </span>
            <span className="text-xs text-slate-300">Teaching at VIT Pune</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Peer Mentoring Center
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Manage incoming session requests, update skills you teach, and monitor your campus Trust Score.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Your Mentor Score</p>
            <p className="text-2xl font-black text-emerald-400">
              {profile?.trust_score?.score ? Math.round(profile.trust_score.score) : 80}/100
            </p>
            <p className="text-[10px] text-indigo-200">{profile?.completed_sessions_count} sessions taught</p>
          </div>
          <TrustScoreBadge score={profile?.trust_score?.score || 80} size="lg" showLabel={false} />
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Mentor Availability & Scheduling:</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/mentor/availability"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200"
          >
            <Clock className="w-3.5 h-3.5" /> Configure Weekly Slots
          </Link>
          {profile?.id && (
            <Link
              to={`/mentor/${profile.id}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> View Public Mentor Card
            </Link>
          )}
        </div>
      </div>

      {/* Pending Session Requests */}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Pending Session Requests ({pendingRequests.length})
            </h2>
          </div>
          <Link to="/sessions" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View All Sessions
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No incoming pending session requests at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{req.skill.name}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Requested
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    From <strong className="font-semibold">{req.learner.full_name}</strong> ({req.learner.department} • {req.learner.year})
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> {req.scheduled_date} ({req.start_time} - {req.end_time})
                  </p>
                  {req.notes && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100 italic">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-100/60">
                  <button
                    onClick={() => handleRequestResponse(req.id, 'Rejected')}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRequestResponse(req.id, 'Accepted')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teaching Skills Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Skills You Teach</h2>
            <p className="text-xs text-slate-500">Students across VIT Pune can find you for these skills</p>
          </div>
          <button
            onClick={() => setIsAddSkillOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        </div>

        {profile?.teaching_skills.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            You haven't listed any teaching skills yet. Click 'Add Skill' to start mentoring!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile?.teaching_skills.map((ts) => (
              <div key={ts.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{ts.skill.name}</h3>
                  <button
                    onClick={() => handleRemoveSkill(ts.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {ts.proficiency_level}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {ts.years_of_experience} yrs exp
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Peer Verified
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        title="Add a Skill to Teach"
        maxWidth="md"
      >
        <form onSubmit={handleAddTeachingSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Engineering Skill
            </label>
            <select
              value={newSkillId || ''}
              onChange={(e) => setNewSkillId(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Proficiency Level
              </label>
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Years Experience
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="6"
                value={newExperience}
                onChange={(e) => setNewExperience(parseFloat(e.target.value) || 1.0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddSkillOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingSkill}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
            >
              {addingSkill ? 'Saving...' : 'Add to Teaching List'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
