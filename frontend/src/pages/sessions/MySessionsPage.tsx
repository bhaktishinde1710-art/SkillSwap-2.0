import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Star, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import { SessionItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';

export const MySessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'mentor'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewSession, setReviewSession] = useState<SessionItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelSession, setCancelSession] = useState<SessionItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getSessions(roleFilter, statusFilter);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [roleFilter, statusFilter]);

  const handleStatusChange = async (sessionId: number, newStatus: string) => {
    try {
      await sessionService.updateSessionStatus(sessionId, { status: newStatus });
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update session.');
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelSession) return;
    try {
      await sessionService.updateSessionStatus(cancelSession.id, {
        status: 'Cancelled',
        cancellation_reason: cancelReason || 'Rescheduled by student'
      });
      setIsCancelOpen(false);
      setCancelReason('');
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel session.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSession) return;
    setReviewError(null);
    setSubmittingReview(true);

    try {
      await sessionService.submitReview({
        session_id: reviewSession.id,
        rating,
        comment: comment.trim()
      });
      setIsReviewOpen(false);
      setComment('');
      fetchSessions();
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'scheduled':
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Scheduled</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Learning Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your 1-on-1 peer sessions, join online calls, and provide mentor feedback.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('learner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'learner' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            As Learner
          </button>
          <button
            onClick={() => setRoleFilter('mentor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'mentor' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            As Mentor
          </button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Pending', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any sessions matching the selected filter. Find a mentor to book your next session!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const isLearner = sess.learner_id === user?.id;
            const otherParty = isLearner ? sess.mentor : sess.learner;

            return (
              <div
                key={sess.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-base text-slate-900">{sess.skill.name}</h3>
                      {getStatusBadge(sess.status)}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {isLearner ? 'Attending' : 'Teaching'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      With <strong className="text-slate-800 font-semibold">{otherParty.full_name}</strong> ({otherParty.department})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mode & Meeting Link */}
                    {sess.mode === 'Online' && sess.meeting_link && (sess.status === 'Scheduled' || sess.status === 'Accepted') && (
                      <a
                        href={sess.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Call
                      </a>
                    )}

                    {/* Mentor Accept / Reject for Pending */}
                    {!isLearner && sess.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(sess.id, 'Accepted')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(sess.id, 'Rejected')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Mark Completed */}
                    {(sess.status === 'Scheduled' || sess.status === 'Accepted') && (
                      <button
                        onClick={() => handleStatusChange(sess.id, 'Completed')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* Learner Leave Review */}
                    {isLearner && sess.status === 'Completed' && (
                      <button
                        onClick={() => {
                          setReviewSession(sess);
                          setIsReviewOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {/* Cancel Session */}
                    {(sess.status === 'Scheduled' || sess.status === 'Pending') && (
                      <button
                        onClick={() => {
                          setCancelSession(sess);
                          setIsCancelOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {sess.scheduled_date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {sess.start_time} - {sess.end_time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {sess.mode === 'Online' ? <Video className="w-3.5 h-3.5 text-indigo-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                    {sess.location || sess.mode}
                  </span>
                  {sess.notes && (
                    <span className="text-slate-600 italic">
                      Goal: "{sess.notes}"
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Leave Feedback for Mentor"
        maxWidth="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {reviewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{reviewError}</span>
            </div>
          )}

          <div className="text-center space-y-2 py-2">
            <p className="text-xs text-slate-500">
              How was your peer session with <strong>{reviewSession?.mentor.full_name}</strong>?
            </p>
            <div className="flex justify-center">
              <RatingStars
                rating={rating}
                size="lg"
                interactive={true}
                onRatingChange={(r) => setRating(r)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Comment
            </label>
            <textarea
              rows={4}
              required
              minLength={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain how the mentor clarified your doubts, their teaching style, and recommendations for other students..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Learning Session"
        maxWidth="md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel this peer session? Please provide a brief note so the other student is informed.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Cancellation
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Clash with college lab submission, rescheduled by mutual agreement..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
