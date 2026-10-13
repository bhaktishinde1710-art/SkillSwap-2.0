import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  MapPin, 
  Video, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { userService } from '../../services/userService';
import { sessionService } from '../../services/sessionService';
import { UserDetail, ReviewItem } from '../../types';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

export const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialBookSkillId = searchParams.get('bookSkill');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState<UserDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [sessionMode, setSessionMode] = useState('Online');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const mentorId = parseInt(id);
        const [mentorData, reviewsData] = await Promise.all([
          userService.getMentorById(mentorId),
          sessionService.getUserReviews(mentorId)
        ]);
        setMentor(mentorData);
        setReviews(reviewsData);

        if (initialBookSkillId) {
          const matched = mentorData.teaching_skills.find(ts => ts.skill_id === parseInt(initialBookSkillId));
          if (matched) {
            setSelectedSkillId(matched.skill_id);
            setIsBookingOpen(true);
          }
        } else if (mentorData.teaching_skills.length > 0) {
          setSelectedSkillId(mentorData.teaching_skills[0].skill_id);
        }

        // Set tomorrow's date by default for booking
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setBookingDate(tomorrow.toISOString().split('T')[0]);

      } catch (err) {
        console.error('Failed to load mentor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id, initialBookSkillId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedSkillId) {
      setBookingError('Please select a skill for this session.');
      return;
    }

    if (startTime >= endTime) {
      setBookingError('Start time must be before end time.');
      return;
    }

    setSubmittingBooking(true);
    try {
      await sessionService.bookSession({
        mentor_id: mentor!.id,
        skill_id: selectedSkillId,
        scheduled_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        mode: sessionMode,
        location: sessionMode === 'Online' ? 'Google Meet' : 'VIT Central Library Pod 3',
        notes: notes.trim()
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingOpen(false);
        navigate('/sessions');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Could not schedule session. Please check your time slot.';
      setBookingError(msg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading mentor profile...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Mentor Not Found</h2>
        <p className="text-xs text-slate-500">The requested peer mentor profile does not exist.</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === mentor.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Mentor Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {mentor.first_name[0]}{mentor.last_name[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {mentor.full_name}
                </h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VIT Verified
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {mentor.department} • {mentor.year}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {mentor.college_email}
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-end gap-3 justify-between sm:justify-start">
            <TrustScoreBadge score={mentor.trust_score?.score || 80} size="lg" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <RatingStars rating={mentor.average_rating || 5.0} />
              <span>{mentor.average_rating ? mentor.average_rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 font-normal">({mentor.completed_sessions_count} sessions)</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              "{mentor.bio}"
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isSelf && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Learning Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Trust Score Breakdown & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Trust Score Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Trust Score Breakdown</h3>
            </div>
            <span className="text-xs font-bold text-indigo-600">
              {mentor.trust_score?.score ? Math.round(mentor.trust_score.score) : 80}/100 Overall
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Teaching Quality (Student Reviews)</span>
                <span className="text-indigo-700">{mentor.trust_score?.teaching_score?.toFixed(0) || 85}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${mentor.trust_score?.teaching_score || 85}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Session Completion Ratio</span>
                <span className="text-emerald-700">{mentor.trust_score?.completion_score?.toFixed(0) || 90}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${mentor.trust_score?.completion_score || 90}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Reliability (Punctuality & Low Cancel)</span>
                <span className="text-sky-700">{mentor.trust_score?.reliability_score?.toFixed(0) || 85}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${mentor.trust_score?.reliability_score || 85}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Review Volume & Skill Verification</span>
                <span className="text-purple-700">{mentor.trust_score?.review_score?.toFixed(0) || 80}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${mentor.trust_score?.review_score || 80}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Availability Schedule */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Weekly Availability</h3>
            </div>
            <span className="text-xs font-medium text-slate-400">Campus Hours</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {mentor.availabilities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Mentor has flexible peer hours on request.</p>
            ) : (
              mentor.availabilities.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="font-bold text-slate-800">{a.day}</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {a.start_time} - {a.end_time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Teaching Skills Catalog */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Teaching Skills & Proficiencies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mentor.teaching_skills.map((ts) => (
            <div key={ts.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{ts.skill.name}</h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {ts.proficiency_level}
                </span>
              </div>
              <p className="text-xs text-slate-500">{ts.years_of_experience} year(s) hands-on practice</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Peer Verified
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Reviews Received */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Verified Student Reviews ({reviews.length})</h3>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No reviews submitted yet for this peer mentor.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{rev.reviewer.full_name}</span>
                    <span className="text-[10px] text-slate-400">({rev.reviewer.department?.split(' ')?.[0]})</span>
                  </div>
                  <RatingStars rating={rev.rating} size="sm" showText={true} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Session Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={`Request Session with ${mentor.first_name}`}
        maxWidth="lg"
      >
        {bookingSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Session Request Dispatched!</h3>
            <p className="text-xs text-slate-500">
              Mentor {mentor.first_name} has been notified. You can track confirmation under 'My Sessions'.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{bookingError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic / Skill to Learn
              </label>
              <select
                value={selectedSkillId || ''}
                onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {mentor.teaching_skills.map((ts) => (
                  <option key={ts.skill_id} value={ts.skill_id}>
                    {ts.skill.name} ({ts.proficiency_level})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSessionMode('Online')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    sessionMode === 'Online'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Online (Google Meet)
                </button>
                <button
                  type="button"
                  onClick={() => setSessionMode('Offline')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    sessionMode === 'Offline'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> VIT Campus Library
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specific Doubts / Problem Statements
              </label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention specific LeetCode problem, error code, or project component you need guidance with..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBooking}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submittingBooking ? 'Checking Conflicts...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
