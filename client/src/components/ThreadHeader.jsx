import { AuthorAvatar, Tag, Button } from './ui';

function ThreadHeader({ thread, isAuthor, onEdit, onDelete, formatTimeAgo }) {
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

  return (
    <div className="mb-6">
      {/* Category and Actions */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white uppercase tracking-wide ${getCategoryColor(thread.category)}`}>
          {thread.category}
        </span>
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{thread.title}</h1>

      {/* Author Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-700">
        <AuthorAvatar
          author={thread.author}
          size="md"
          subtitle={thread.author?.role || 'Member'}
          clickable={!!thread.author?._id}
        />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>•</span>
          <span>asked {formatTimeAgo(thread.createdAt)}</span>
          {thread.updatedAt && new Date(thread.updatedAt).getTime() !== new Date(thread.createdAt).getTime() && (
            <>
              <span>•</span>
              <span>edited {formatTimeAgo(thread.updatedAt)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadHeader;
