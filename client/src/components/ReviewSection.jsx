import { useState } from 'react';
import { AuthorAvatar } from './ui';

function ReviewSection({ 
  reviews, 
  reviewStats, 
  userReview, 
  isOwner, 
  token,
  onQuickReview,
  onReviewSubmit,
  onDeleteReview,
  showReviewForm,
  setShowReviewForm,
  reviewFormData,
  setReviewFormData
}) {
  return (
    <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Community Feedback</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="font-semibold text-green-500">{reviewStats.likes}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="font-semibold text-red-500">{reviewStats.dislikes}</span>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      {!isOwner && (
        <div className="mb-8">
          {userReview ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-2 rounded-lg ${userReview.rating === 'like' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {userReview.rating === 'like' ? (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-500 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Your Review</p>
                  {userReview.comment && <p className="text-gray-400">{userReview.comment}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                  onClick={() => setShowReviewForm(true)}
                >
                  Edit
                </button>
                <button 
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                  onClick={onDeleteReview}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl transition-all font-medium"
                onClick={() => onQuickReview('like')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Helpful
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all font-medium"
                onClick={() => onQuickReview('dislike')}
              >
                <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Not Helpful
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 rounded-xl transition-all font-medium"
                onClick={() => setShowReviewForm(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-6">Share Your Feedback</h3>
          <div className="flex gap-3 mb-6">
            <button
              className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                reviewFormData.rating === 'like'
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400 scale-105'
                  : 'bg-neutral-700 border-2 border-neutral-600 text-gray-400 hover:border-green-500/50'
              }`}
              onClick={() => setReviewFormData({ ...reviewFormData, rating: 'like' })}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Helpful
              </div>
            </button>
            <button
              className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                reviewFormData.rating === 'dislike'
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400 scale-105'
                  : 'bg-neutral-700 border-2 border-neutral-600 text-gray-400 hover:border-red-500/50'
              }`}
              onClick={() => setReviewFormData({ ...reviewFormData, rating: 'dislike' })}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Not Helpful
              </div>
            </button>
          </div>
          <textarea
            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-4 placeholder-gray-500"
            placeholder="Share your thoughts about this project (optional)..."
            value={reviewFormData.comment}
            onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
            rows="4"
            maxLength={500}
          />
          <div className="flex justify-end gap-3">
            <button 
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 rounded-xl transition-colors font-medium" 
              onClick={() => {
                setShowReviewForm(false);
                setReviewFormData({ rating: '', comment: '' });
              }}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 bg-primary hover:bg-primary/90 border border-primary text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onReviewSubmit(reviewFormData.rating)}
              disabled={!reviewFormData.rating}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="flex items-start gap-3 py-4 border-b border-neutral-700/50 last:border-0 hover:bg-neutral-800/30 px-4 -mx-4 rounded-lg transition-colors">
              <div className="flex-shrink-0">
                <AuthorAvatar
                  author={review.user}
                  size="sm"
                  clickable={!!review.user?._id}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-200 text-sm">
                    {review.user?.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    review.rating === 'like' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {review.rating === 'like' ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        Helpful
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        Not Helpful
                      </>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-1">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isOwner && !userReview && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to share your feedback</p>
          </div>
        )
      )}
    </div>
  );
}

export default ReviewSection;
