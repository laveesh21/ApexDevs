import { Link } from 'react-router-dom';
import './DiscussionCard.css';

function DiscussionCard({ discussion }) {
  const getTypeColor = (type) => {
    const colors = {
      'Question': '#00be62',
      'Discussion': '#1f6feb',
      'Tutorial': '#d73a49',
      'Show & Tell': '#f97316',
      'Help Wanted': '#a371f7',
      'Bug Report': '#e85d04'
    };
    return colors[type] || '#00be62';
  };

  return (
    <Link to={`/thread/${discussion.id}`} className="discussion-card">
      <div className="discussion-votes">
        <button className="vote-btn upvote" onClick={(e) => e.preventDefault()}>▲</button>
        <span className="vote-count">{discussion.votes}</span>
        <button className="vote-btn downvote" onClick={(e) => e.preventDefault()}>▼</button>
      </div>

      <div className="discussion-content">
        <div className="discussion-header">
          <span 
            className="discussion-type-badge" 
            style={{ backgroundColor: getTypeColor(discussion.type) }}
          >
            {discussion.type}
          </span>
          <h3 className="discussion-title">{discussion.title}</h3>
        </div>
        <p className="discussion-excerpt">{discussion.excerpt}</p>

        <div className="discussion-tags">
          {discussion.tags.map((tag, index) => (
            <span key={index} className="discussion-tag">{tag}</span>
          ))}
        </div>

        <div className="discussion-meta">
          <div className="meta-left">
            <span className="meta-item">
              <span className="meta-icon">👤</span>
              {discussion.author}
            </span>
            <span className="meta-item">
              <span className="meta-icon">💬</span>
              {discussion.answers} {discussion.answers === 1 ? 'answer' : 'answers'}
            </span>
            <span className="meta-item">
              <span className="meta-icon">👁</span>
              {discussion.views} views
            </span>
          </div>
          <span className="meta-time">{discussion.timeAgo}</span>
        </div>

        {discussion.hasAcceptedAnswer && (
          <div className="accepted-badge">✓ Answered</div>
        )}
      </div>
    </Link>
  );
}

export default DiscussionCard;
