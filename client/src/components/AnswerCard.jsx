import { useState } from 'react';
import { AuthorAvatar, VoteCounter, Button } from './ui';

function AnswerCard({ 
  comment, 
  voteData,
  isAuthor,
  isEditing,
  editContent,
  onVoteUp,
  onVoteDown,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onContentChange
}) {
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

  const renderContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      const formattedParagraph = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-neutral-700 rounded text-primary text-sm">$1</code>')
        .replace(/- (.*?)$/gm, '<li>$1</li>');
      
      if (formattedParagraph.includes('<li>')) {
        return (
          <ul key={index} className="list-disc pl-5 mb-3 text-gray-300 space-y-1" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
        );
      }
      
      return paragraph.trim() && (
        <p key={index} className="mb-3 text-gray-300 leading-relaxed last:mb-0" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
      );
    });
  };

  return (
    <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 hover:border-neutral-600 transition-colors">
      <div className="flex gap-6">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteCounter
            score={voteData.voteScore}
            userVote={voteData.voteStatus}
            onUpvote={onVoteUp}
            onDownvote={onVoteDown}
            orientation="vertical"
            size="md"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AuthorAvatar
                author={comment.author}
                size="sm"
                clickable={!!comment.author?._id}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 italic">edited</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isAuthor && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Edit comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 text-white rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                value={editContent}
                onChange={onContentChange}
                rows="6"
                placeholder="Write your comment..."
              />
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={onSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {renderContent(comment.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnswerCard;
