import { Link } from 'react-router-dom';
import './DiscussionCard.css';

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
    <Link to={`/thread/${discussion._id}`} className="discussion-card">
      <div className="discussion-votes">
        <button className="vote-btn upvote" onClick={(e) => e.preventDefault()}>▲</button>
        <span className="vote-count">{voteScore}</span>
        <button className="vote-btn downvote" onClick={(e) => e.preventDefault()}>▼</button>
      </div>

      <div className="discussion-content">
        <div className="discussion-header">
          <span 
            className="discussion-type-badge" 
            style={{ backgroundColor: getTypeColor(discussion.category) }}
          >
            {discussion.category}
          </span>
          <h3 className="discussion-title">{discussion.title}</h3>
        </div>
        <p className="discussion-excerpt">{getExcerpt(discussion.content)}</p>

        <div className="discussion-tags">
          {discussion.tags.map((tag, index) => (
            <span key={index} className="discussion-tag">{tag}</span>
          ))}
        </div>

        <div className="discussion-meta">
          <div className="meta-left">
            <span className="meta-item">
              <div className="author-avatar-small">
                {discussion.author?.avatar ? (
                  <img src={discussion.author.avatar} alt={discussion.author.username} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              {discussion.author?._id ? (
                <Link 
                  to={`/user/${discussion.author._id}`} 
                  className="author-link-inline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {discussion.author.username}
                </Link>
              ) : (
                <span>{discussion.author?.username || 'Anonymous'}</span>
              )}
            </span>
            <span className="meta-item">
              <span className="meta-icon">💬</span>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
            <span className="meta-item">
              <span className="meta-icon">👁</span>
              {discussion.views} views
            </span>
            {discussion.updatedAt && new Date(discussion.updatedAt).getTime() !== new Date(discussion.createdAt).getTime() && (
              <span className="meta-item edited-indicator">
                <span className="meta-icon">✏️</span>
                edited
              </span>
            )}
          </div>
          <span className="meta-time">{formatTimeAgo(discussion.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export default DiscussionCard;
