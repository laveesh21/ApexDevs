import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { threadsData } from '../data/threadsData';
import './ThreadDetail.css';

function ThreadDetail() {
  const { id } = useParams();
  const thread = threadsData.find(t => t.id === parseInt(id));
  const [vote, setVote] = useState(0);
  const [answerVotes, setAnswerVotes] = useState({});

  if (!thread) {
    return (
      <div className="thread-not-found">
        <h2>Thread not found</h2>
        <Link to="/community" className="back-link">← Back to Community</Link>
      </div>
    );
  }

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

  const handleVote = (value) => {
    if (vote === value) {
      setVote(0);
    } else {
      setVote(value);
    }
  };

  const handleAnswerVote = (answerId, value) => {
    if (answerVotes[answerId] === value) {
      setAnswerVotes({ ...answerVotes, [answerId]: 0 });
    } else {
      setAnswerVotes({ ...answerVotes, [answerId]: value });
    }
  };

  const getTotalVotes = (baseVotes, currentVote) => {
    return baseVotes + currentVote;
  };

  return (
    <div className="thread-detail-container">
      <div className="thread-detail-content">
        <Link to="/community" className="back-link">← Back to Community</Link>

        {/* Thread Header */}
        <div className="thread-header">
          <span 
            className="thread-type-badge" 
            style={{ backgroundColor: getTypeColor(thread.type) }}
          >
            {thread.type}
          </span>
          <h1 className="thread-title">{thread.title}</h1>
          
          <div className="thread-meta">
            <span className="meta-item">
              <span className="meta-icon">👤</span>
              Asked by <strong>{thread.author}</strong>
            </span>
            <span className="meta-item">
              <span className="meta-icon">🕒</span>
              {thread.createdAt}
            </span>
            <span className="meta-item">
              <span className="meta-icon">👁</span>
              {thread.views} views
            </span>
          </div>
        </div>

        {/* Main Question/Thread */}
        <div className="thread-main">
          <div className="thread-voting">
            <button 
              className={`vote-btn upvote ${vote === 1 ? 'active' : ''}`}
              onClick={() => handleVote(1)}
            >
              ▲
            </button>
            <span className="vote-count">{getTotalVotes(thread.votes, vote)}</span>
            <button 
              className={`vote-btn downvote ${vote === -1 ? 'active' : ''}`}
              onClick={() => handleVote(-1)}
            >
              ▼
            </button>
          </div>

          <div className="thread-body">
            <div className="thread-content">
              {thread.content.split('\n').map((paragraph, index) => {
                // Handle code blocks
                if (paragraph.startsWith('```')) {
                  return null; // We'll handle this with a separate code block parser
                }
                // Handle bold text
                const formattedParagraph = paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/- (.*?)$/gm, '<li>$1</li>');
                
                if (formattedParagraph.includes('<li>')) {
                  return (
                    <ul key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                  );
                }
                
                return paragraph.trim() && (
                  <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                );
              })}
            </div>

            <div className="thread-tags">
              {thread.tags.map((tag, index) => (
                <span key={index} className="thread-tag">{tag}</span>
              ))}
            </div>

            <div className="thread-author-info">
              <div className="author-avatar">{thread.authorAvatar}</div>
              <div className="author-details">
                <div className="author-name">{thread.author}</div>
                <div className="author-meta">Posted {thread.createdAt}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="answers-section">
          <h2 className="answers-header">
            {thread.answers.length} {thread.answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {thread.answers.map(answer => (
            <div key={answer.id} className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}>
              {answer.isAccepted && (
                <div className="accepted-answer-badge">
                  <span className="check-icon">✓</span>
                  Accepted Answer
                </div>
              )}

              <div className="answer-voting">
                <button 
                  className={`vote-btn upvote ${answerVotes[answer.id] === 1 ? 'active' : ''}`}
                  onClick={() => handleAnswerVote(answer.id, 1)}
                >
                  ▲
                </button>
                <span className="vote-count">
                  {getTotalVotes(answer.votes, answerVotes[answer.id] || 0)}
                </span>
                <button 
                  className={`vote-btn downvote ${answerVotes[answer.id] === -1 ? 'active' : ''}`}
                  onClick={() => handleAnswerVote(answer.id, -1)}
                >
                  ▼
                </button>
              </div>

              <div className="answer-body">
                <div className="answer-content">
                  {answer.content.split('\n').map((paragraph, index) => {
                    const formattedParagraph = paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/- (.*?)$/gm, '<li>$1</li>');
                    
                    if (formattedParagraph.includes('<li>')) {
                      return (
                        <ul key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                      );
                    }
                    
                    return paragraph.trim() && (
                      <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                    );
                  })}
                </div>

                <div className="answer-author-info">
                  <div className="author-avatar">{answer.authorAvatar}</div>
                  <div className="author-details">
                    <div className="author-name">{answer.author}</div>
                    <div className="author-meta">Answered {answer.createdAt}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Answer Section */}
        <div className="add-answer-section">
          <h3>Your Answer</h3>
          <textarea 
            className="answer-textarea" 
            placeholder="Write your answer here... Use Markdown for formatting"
            rows="8"
          ></textarea>
          <button className="submit-answer-btn">Post Your Answer</button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="thread-sidebar">
        <div className="sidebar-card">
          <h3>Thread Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Asked</span>
            <span className="stat-value">{thread.createdAt}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Viewed</span>
            <span className="stat-value">{thread.views} times</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Answers</span>
            <span className="stat-value">{thread.answers.length}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Related Tags</h3>
          <div className="related-tags">
            {thread.tags.map((tag, index) => (
              <Link key={index} to="/community" className="related-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Community Guidelines</h3>
          <ul className="guidelines-list">
            <li>Be respectful and constructive</li>
            <li>Stay on topic</li>
            <li>Provide code examples when relevant</li>
            <li>Mark helpful answers as accepted</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default ThreadDetail;
