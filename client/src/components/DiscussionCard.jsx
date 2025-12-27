import { Link } from 'react-router-dom';
import { getSelectedAvatar } from '../utils/avatarHelper';

function DiscussionCard({ discussion }) {
  const getTypeColor = (category) => {
    const colors = {
      'General': '#1f6feb',
      'Questions': '#00be62',
      'Showcase': '#f97316',
      'Resources': '#d73a49',
      'Collaboration': '#a371f7',
      'Feedback': '#e85d04',
      'Other': '#6c757d'
    };
    return colors[category] || '#00be62';
  };

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
      className="flex gap-4 bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-primary/50 transition-all group"
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <button 
          className="text-gray-400 hover:text-primary transition-colors" 
          onClick={(e) => e.preventDefault()}
        >
          ▲
        </button>
        <span className="text-lg font-semibold text-white">{voteScore}</span>
        <button 
          className="text-gray-400 hover:text-red-400 transition-colors" 
          onClick={(e) => e.preventDefault()}
        >
          ▼
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3 mb-3">
          <span 
            className="px-3 py-1 rounded text-xs font-semibold text-white" 
            style={{ backgroundColor: getTypeColor(discussion.category) }}
          >
            {discussion.category}
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {discussion.title}
          </h3>
        </div>
        <p className="text-gray-400 mb-4 line-clamp-3">{getExcerpt(discussion.content)}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-dark-600">
                <img 
                  src={getSelectedAvatar(discussion.author)} 
                  alt={discussion.author?.username} 
                  className="w-full h-full object-cover"
                />
              </div>
              {discussion.author?._id ? (
                <Link 
                  to={`/user/${discussion.author._id}`} 
                  className="text-primary hover:text-primary-light transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {discussion.author.username}
                </Link>
              ) : (
                <span className="text-gray-400">{discussion.author?.username || 'Anonymous'}</span>
              )}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <span>💬</span>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <span>👁</span>
              {discussion.views} views
            </span>
            {discussion.updatedAt && new Date(discussion.updatedAt).getTime() !== new Date(discussion.createdAt).getTime() && (
              <span className="flex items-center gap-1 text-primary text-xs">
                <span>✏️</span>
                edited
              </span>
            )}
          </div>
          <span className="text-gray-500 text-xs">{formatTimeAgo(discussion.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default DiscussionCard;
