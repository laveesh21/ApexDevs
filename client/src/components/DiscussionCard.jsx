import { Link } from 'react-router-dom';
import { Tag, AuthorAvatar, Stat, VoteCounter } from './ui';
import { getCategoryVariant } from '../constants/categories';

function DiscussionCard({ discussion }) {
  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    return createdAt.toLocaleDateString();
  };

  // Truncate content for excerpt
  const getExcerpt = (content) => {
    if (content.length <= 200) return content;
    return content.substring(0, 200) + '...';
  };

  const commentCount = discussion.commentCount || 0;
  const upvotes = discussion.upvotes?.length || 0;
  const downvotes = discussion.downvotes?.length || 0;
  const voteScore = upvotes - downvotes;

  return (
    <Link 
      to={`/thread/${discussion._id}`} 
      className="flex gap-1.5 sm:gap-2 md:gap-3 bg-neutral-800 border border-neutral-600 rounded-lg sm:rounded-xl p-1.5 sm:p-3 md:p-4 hover:border-primary/50 transition-all group"
    >
      <VoteCounter
        score={voteScore}
        userVote={null}
        onUpvote={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDownvote={(e) => { e.preventDefault(); e.stopPropagation(); }}
        orientation="vertical"
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <Tag variant={getCategoryVariant(discussion.category)} size="xs" className="flex-shrink-0 mb-1 sm:mb-1.5 inline-block">
          {discussion.category}
        </Tag>
        <h3 className="text-xs sm:text-base md:text-lg font-bold text-white group-hover:text-green-500 transition-colors line-clamp-2 mb-1.5 sm:mb-2 md:mb-3">
          {discussion.title}
        </h3>
          <p className="text-[0.8rem] sm:text-xs md:text-sm text-gray-400 mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 sm:line-clamp-3">{getExcerpt(discussion.content)}</p>

          <div className="flex flex-wrap gap-0.5 sm:gap-1 md:gap-2 mb-1.5 sm:mb-2 md:mb-3">
            {discussion.tags.map((tag, index) => (
              <Tag key={index} variant="primary" size="xxs" className="sm:text-[10px] md:text-xs">
                {tag}
              </Tag>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <AuthorAvatar 
                author={discussion.author}
                size="xs"
                clickable={false}
              />
              <Stat
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                }
                value={commentCount}
                text={commentCount === 1 ? 'comment' : 'comments'}
                className="text-[10px] sm:text-xs"
              />
              <Stat
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
                value={discussion.views}
                text="views"
                className="text-[10px] sm:text-xs"
              />
              {discussion.updatedAt && new Date(discussion.updatedAt).getTime() !== new Date(discussion.createdAt).getTime() && (
                <Stat
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  }
                  text="edited"
                  className="text-green-500 text-[10px] sm:text-xs"
                />
              )}
            </div>
            <span className="text-gray-500 text-[10px] sm:text-xs">{formatTimeAgo(discussion.createdAt)}</span>
          </div>
      </div>
    </Link>
  );
}

export default DiscussionCard;
