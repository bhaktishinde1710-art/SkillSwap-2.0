import React, { useState, useEffect } from 'react';
import { Star, Search, Trash2, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';

export const ReviewsManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!selectedReview) return;
    setDeleting(true);
    try {
      await adminService.deleteReview(selectedReview.id);
      setDeleteModalOpen(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Could not remove review.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const reviewerName = r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}`.toLowerCase() : '';
    const mentorName = r.reviewed_user ? `${r.reviewed_user.first_name} ${r.reviewed_user.last_name}`.toLowerCase() : '';
    const commentMatch = (r.comment || '').toLowerCase().includes(search.toLowerCase());
    const nameMatch = reviewerName.includes(search.toLowerCase()) || mentorName.includes(search.toLowerCase());
    const matchesSearch = commentMatch || nameMatch;

    const matchesStar = starFilter === 'All' || r.rating.toString() === starFilter;
    return matchesSearch && matchesStar;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Peer Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500">
            Audit student ratings, mentor feedback, and moderate inappropriate or policy-violating reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            Total Reviews: {reviews.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, mentor, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter by Rating:</span>
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="All">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading reviews directory...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No reviews match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Rating</th>
                  <th className="p-4">Reviewer</th>
                  <th className="p-4">Mentor</th>
                  <th className="p-4">Feedback / Comment</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <RatingStars rating={rev.rating} size="sm" />
                        <span className="font-extrabold text-slate-900 ml-1">{rev.rating}.0</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {rev.reviewer ? (
                        <div>
                          <p className="font-bold text-slate-900">{rev.reviewer.first_name} {rev.reviewer.last_name}</p>
                          <p className="text-[10px] text-slate-400">{rev.reviewer.college_email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">User #{rev.reviewer_id}</span>
                      )}
                    </td>

                    <td className="p-4">
                      {rev.reviewed_user ? (
                        <div>
                          <p className="font-bold text-indigo-700">{rev.reviewed_user.first_name} {rev.reviewed_user.last_name}</p>
                          <p className="text-[10px] text-slate-400">{rev.reviewed_user.department}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Mentor #{rev.reviewed_user_id}</span>
                      )}
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="text-slate-700 leading-relaxed text-xs">
                        "{rev.comment}"
                      </p>
                    </td>

                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(rev.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReview(rev);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Inappropriate Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedReview(null);
        }}
        title="Moderate & Remove Review"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-bold">Are you sure you want to delete this review?</p>
              <p className="mt-1">
                Removing this review will automatically trigger a dynamic recalculation of the mentor's Trust Score and Teaching Quality metrics.
              </p>
            </div>
          </div>

          {selectedReview && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">
                Rating: {selectedReview.rating}★
              </p>
              <p className="italic text-slate-600">
                "{selectedReview.comment}"
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedReview(null);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-sm"
            >
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
