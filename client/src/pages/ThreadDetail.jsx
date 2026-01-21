import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { threadAPI } from '../services/api';
import Modal from '../components/Modal';
import ThreadSidebar from '../components/ThreadSidebar';
import CommentsSection from '../components/CommentsSection';
import NewDiscussionForm from '../components/NewDiscussionForm';
import { Tag, Button, VoteCounter } from '../components/ui';

function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [voteStatus, setVoteStatus] = useState(null);
  const [voteScore, setVoteScore] = useState(0);
  const [commentVotes, setCommentVotes] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: '',
    cancelText: ''
  });
  const hasFetched = useRef(false);
  const voteTimeout = useRef(null);
  const pendingVote = useRef(null);
  const commentVoteTimeouts = useRef({});

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

  const isThreadAuthor = (author) => {
    if (!user || !author) return false;
    const userId = user._id || user.id;
    const authorId = author._id || author.id;
    return userId === authorId;
  };

  const isCommentAuthor = (author) => {
    if (!user || !author) return false;
    const userId = user._id || user.id;
    const authorId = author._id || author.id;
    return userId === authorId;
  };

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchThread = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await threadAPI.getById(id, token);
        setThread(response.data);
        setVoteStatus(response.data.userVote);
        setVoteScore(response.data.voteScore || 0);
        
        const commentsResponse = await threadAPI.getComments(id, token);
        setComments(commentsResponse.data);
        
        const votesState = {};
        commentsResponse.data.forEach(comment => {
          votesState[comment._id] = {
            voteStatus: comment.userVote,
            voteScore: comment.voteScore || 0
          };
        });
        setCommentVotes(votesState);
        
        hasFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch thread:', err);
        setError('Thread not found');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    return () => {
      hasFetched.current = false;
      if (voteTimeout.current) clearTimeout(voteTimeout.current);
      Object.values(commentVoteTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [id, token]);

  const sendVoteToAPI = useCallback(async (voteType) => {
    if (!token || !voteType) return;
    
    try {
      const response = await threadAPI.vote(token, id, voteType);
      setVoteScore(response.data.voteScore);
      setVoteStatus(response.data.userVote);
    } catch (err) {
      console.error('Failed to vote:', err);
      const response = await threadAPI.getById(id, token);
      setVoteScore(response.data.voteScore || 0);
      setVoteStatus(response.data.userVote);
    }
  }, [token, id]);

  const handleVote = (type) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to vote on threads.',
        type: 'info'
      });
      return;
    }

    let newVoteScore = voteScore;
    let newVoteStatus = voteStatus;

    if (voteStatus === type) {
      newVoteStatus = null;
      newVoteScore = type === 'upvote' ? voteScore - 1 : voteScore + 1;
    } else if (voteStatus === null) {
      newVoteStatus = type;
      newVoteScore = type === 'upvote' ? voteScore + 1 : voteScore - 1;
    } else {
      newVoteStatus = type;
      newVoteScore = type === 'upvote' ? voteScore + 2 : voteScore - 2;
    }

    setVoteStatus(newVoteStatus);
    setVoteScore(newVoteScore);
    
    pendingVote.current = type;

    if (voteTimeout.current) clearTimeout(voteTimeout.current);

    voteTimeout.current = setTimeout(() => {
      sendVoteToAPI(pendingVote.current);
      pendingVote.current = null;
    }, 500);
  };

  const handleCommentVote = async (commentId, type) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to vote on comments.',
        type: 'info'
      });
      return;
    }

    if (commentVoteTimeouts.current[commentId]) {
      clearTimeout(commentVoteTimeouts.current[commentId]);
    }

    try {
      const response = await threadAPI.voteComment(token, commentId, type);
      setCommentVotes(prev => ({
        ...prev,
        [commentId]: {
          voteStatus: response.data.userVote,
          voteScore: response.data.voteScore
        }
      }));
    } catch (err) {
      console.error('Failed to vote on comment:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to comment on threads.',
        type: 'info'
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await threadAPI.addComment(token, id, { content: newComment });
      const newCommentData = response.data;
      setComments([...comments, newCommentData]);
      
      setCommentVotes(prev => ({
        ...prev,
        [newCommentData._id]: {
          voteStatus: null,
          voteScore: 0
        }
      }));
      
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await threadAPI.update(token, id, {
        title: formData.title,
        content: formData.content,
        category: formData.type,
        tags: formData.tags
      });
      setThread(response.data);
      setShowEditForm(false);
    } catch (err) {
      console.error('Failed to update thread:', err);
    }
  };

  const handleDelete = () => {
    setModalState({
      isOpen: true,
      title: 'Delete Thread',
      message: 'Are you sure you want to delete this thread? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await threadAPI.delete(token, id);
          navigate('/community');
        } catch (err) {
          console.error('Failed to delete thread:', err);
        }
      },
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await threadAPI.updateComment(token, commentId, { content: editCommentContent });
      setComments(comments.map(c => c._id === commentId ? response.data : c));
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleDeleteComment = (commentId) => {
    setModalState({
      isOpen: true,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      type: 'warning',
      onConfirm: async () => {
        try {
          await threadAPI.deleteComment(token, commentId);
          setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
          console.error('Failed to delete comment:', err);
        }
      },
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Questions': 'bg-blue-500',
      'Showcase': 'bg-purple-500',
      'Resources': 'bg-green-500',
      'Collaboration': 'bg-yellow-500',
      'Feedback': 'bg-pink-500',
      'General': 'bg-gray-500',
      'Other': 'bg-neutral-600'
    };
    return colors[category] || 'bg-neutral-600';
  };

  const renderContent = (content) => {
    const isLong = content.length > 1500;
    const contentToUse = showFullContent || !isLong ? content : content.slice(0, 1500);

    return contentToUse.split('\n').map((paragraph, index) => {
      const formattedParagraph = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-neutral-700 rounded text-gray-200 text-sm">$1</code>')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Thread Not Found</h1>
          <Link to="/community" className="text-gray-200 hover:underline">
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4 md:py-6">
        {/* Back Button */}
        <Link 
          to="/community" 
          className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-gray-200 mb-2 sm:mb-4 md:mb-6 transition-colors group"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Back to Community</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-2 sm:space-y-4 md:space-y-6">
            {/* Thread Card */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg sm:rounded-xl overflow-hidden">
              <div className="p-2 sm:p-4 md:p-6">
                <div className="mb-2 sm:mb-4 md:mb-6">
                  {/* Category and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-3">
                    <span className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wide ${getCategoryColor(thread.category)} inline-block w-fit`}>
                      {thread.category}
                    </span>
                    {isThreadAuthor(thread.author) && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                          variant="secondary"
                          size="xs"
                          className="sm:text-sm md:text-base"
                          onClick={handleEditClick}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          className="sm:text-sm md:text-base"
                          onClick={handleDelete}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">{thread.title}</h1>

                  {/* Content */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    {renderContent(thread.content)}
                    {thread.content.length > 1500 && (
                      <button
                        onClick={() => setShowFullContent(s => !s)}
                        className="text-gray-200 hover:text-gray-200/80 text-sm font-medium mt-2 transition-colors"
                      >
                        {showFullContent ? '← Show less' : 'Read more →'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 md:mt-6 space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Vote Counter */}
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-5 border-t border-neutral-700">
                    <VoteCounter
                      score={voteScore}
                      userVote={voteStatus}
                      onUpvote={() => handleVote('upvote')}
                      onDownvote={() => handleVote('downvote')}
                      orientation="horizontal"
                      size="sm"
                      className="text-xs sm:text-sm md:text-base"
                    />
                    <span className="text-[10px] sm:text-xs text-gray-500">Vote to help others find quality content</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection
              comments={comments}
              commentVotes={commentVotes}
              token={token}
              newComment={newComment}
              setNewComment={setNewComment}
              onSubmitComment={handleSubmitComment}
              onCommentVote={handleCommentVote}
              onEditComment={handleEditComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onCancelEdit={handleCancelCommentEdit}
              editingCommentId={editingCommentId}
              editCommentContent={editCommentContent}
              setEditCommentContent={setEditCommentContent}
              isCommentAuthor={isCommentAuthor}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <ThreadSidebar 
                thread={thread} 
                comments={comments.length} 
                voteScore={voteScore} 
              />
            </div>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />

      {showEditForm && thread && (
        <NewDiscussionForm
          onClose={() => setShowEditForm(false)}
          onSubmit={handleEditSubmit}
          initialData={{
            type: thread.category,
            title: thread.title,
            content: thread.content,
            tags: thread.tags || []
          }}
          isEditing={true}
        />
      )}
    </div>
  );
}

export default ThreadDetail;
