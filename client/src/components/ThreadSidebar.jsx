import { Link } from 'react-router-dom';
import { Tag } from './ui';

function ThreadSidebar({ thread, comments, voteScore }) {
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 space-y-8">
      {/* Stats Section */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Thread Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400">Posted</span>
            </div>
            <span className="text-sm text-gray-200 font-medium">{formatTimeAgo(thread.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm text-gray-400">Views</span>
            </div>
            <span className="text-sm text-gray-200 font-medium">{thread.views || 0}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm text-gray-400">Answers</span>
            </div>
            <span className="text-sm text-gray-200 font-medium">{comments}</span>
          </div>

          <div className="flex items-center justify-between py-2 pt-3 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-sm text-gray-400">Score</span>
            </div>
            <span className="text-base text-primary font-bold">{voteScore}</span>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="pt-6 border-t border-neutral-700">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag, index) => (
              <Link key={index} to={`/community?tag=${encodeURIComponent(tag)}`}>
                <Tag variant="primary" size="sm" className="hover:bg-primary/20 transition-colors cursor-pointer">
                  {tag}
                </Tag>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines Section */}
      <div className="pt-6 border-t border-neutral-700">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Guidelines</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <svg className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 leading-relaxed">Be respectful and constructive</span>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 leading-relaxed">Stay on topic and relevant</span>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 leading-relaxed">Include code examples</span>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 leading-relaxed">Upvote helpful responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreadSidebar;
