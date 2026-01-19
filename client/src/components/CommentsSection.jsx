import { useState } from 'react';
import { AuthorAvatar, Button } from './ui';
import { VoteCounter } from './ui';

function CommentsSection({
  comments,
  commentVotes,
  token,
  newComment,
  setNewComment,
  onSubmitComment,
  onCommentVote,
  onEditComment,
  onUpdateComment,
  onDeleteComment,
  onCancelEdit,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  isCommentAuthor
}) {
  const [expandedComments, setExpandedComments] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleExpanded = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const toggleMenu = (commentId) => {
    setOpenMenuId(openMenuId === commentId ? null : commentId);
  };

  const formatContent = (content, isExpanded) => {
    if (!content) return '';
    
    const maxLength = 200;
    const shouldTruncate = content.length > maxLength;
    const displayContent = isExpanded || !shouldTruncate ? content : content.slice(0, maxLength) + '...';
    
    // Format the content with basic markdown-like styling
    const lines = displayContent.split('\n');
    const formatted = lines.map((line, idx) => {
      // Handle bold text **text**
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
      
      // Handle inline code `code`
      line = line.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-neutral-700 text-gray-200 rounded text-sm">$1</code>');
      
      // Handle list items
      if (line.trim().startsWith('- ')) {
        return `<li key="${idx}" class="ml-4">${line.trim().substring(2)}</li>`;
      }
      
      return line ? `<p key="${idx}">${line}</p>` : '<br />';
    });
    
    return { __html: formatted.join('') };
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return commentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">
          {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {/* Comments List or Empty State */}
      {comments.length > 0 ? (
        <>
          {/* Add Answer Form */}
          {token && (
            <div className="mb-6 pb-6 border-b border-neutral-700/50">
              <form onSubmit={onSubmitComment} className="space-y-3">
                <textarea 
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 text-white rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none placeholder-gray-500 transition-colors text-sm" 
                  placeholder="Share your knowledge and help others..."
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Be respectful and provide helpful answers
                  </span>
                  <Button
                    type="submit"
                    variant={newComment.trim() ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    Post Answer
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Comments */}
          <div className="">
            {comments.map(comment => {
              const commentVote = commentVotes[comment._id] || { voteStatus: null, voteScore: 0 };
              const isExpanded = expandedComments[comment._id];
              const shouldShowToggle = comment.content?.length > 200;
              const isMenuOpen = openMenuId === comment._id;

              return (
              <div 
                key={comment._id} 
                className="py-4 border-b border-neutral-700/50 last:border-0 hover:bg-neutral-800/30 px-9 -mx-3  transition-colors"
              >
                <div className="flex items-start gap-3">


                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 -ml-9">
                      <div className="flex items-center gap-2">
                      {/* Author Avatar */}
                      <AuthorAvatar
                        author={comment.author}
                        size="xs"
                        clickable={!!comment.author?._id}
                        className="bg-transparent "
                      />
                    {comment.author?.role && (
                      <>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 capitalize">{comment.author.role}</span>
                      </>
                    )}
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {/* Three Dots Menu */}
                      {isCommentAuthor(comment.author) && (
                        <div className="relative">
                          <button
                            onClick={() => toggleMenu(comment._id)}
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-32 bg-neutral-700 border border-neutral-600 rounded-lg shadow-lg z-20 overflow-hidden">
                                <button
                                  onClick={() => {
                                    onEditComment(comment);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-neutral-600 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteComment(comment._id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-neutral-600 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                  {/* Edit Mode */}
                  {editingCommentId === comment._id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none text-sm"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        rows="4"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onUpdateComment(comment._id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={onCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Content Display */}
                      <div 
                        className="text-sm text-gray-400 leading-relaxed prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={formatContent(comment.content, isExpanded)}
                      />
                      
                      {/* Show more/less button */}
                      {shouldShowToggle && (
                        <button
                          onClick={() => toggleExpanded(comment._id)}
                          className="text-xs text-white hover:text-gray-200/80 mt-2 font-medium transition-colors"
                        >
                          {isExpanded ? '← Show less' : 'Read more →'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Vote Counter - Horizontal at Bottom */}
              {editingCommentId !== comment._id && (
                <div className="flex items-center gap-3 mt-3 -ml-1">
                  <VoteCounter
                    score={commentVote.voteScore}
                    userVote={commentVote.voteStatus}
                    onUpvote={() => onCommentVote(comment._id, 'upvote')}
                    onDownvote={() => onCommentVote(comment._id, 'downvote')}
                    size="sm"
                    orientation="horizontal"
                  />
                </div>
              )}
            </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Empty State */}
          <div className="text-center py-12 mb-6">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-lg">No answers yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to share your knowledge</p>
          </div>

          {/* Add Answer Form - Show when logged in */}
          {token && (
            <div className="pt-6 border-t border-neutral-700/50">
              <form onSubmit={onSubmitComment} className="space-y-3">
                <textarea 
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 text-white rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none placeholder-gray-500 transition-colors text-sm" 
                  placeholder="Share your knowledge and help others..."
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Be respectful and provide helpful answers
                  </span>
                  <Button
                    type="submit"
                    variant={newComment.trim() ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    Post Answer
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CommentsSection;
