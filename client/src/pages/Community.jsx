import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DiscussionCard from '../components/DiscussionCard';
import CommunityFilter from '../components/CommunityFilter';
import NewDiscussionForm from '../components/NewDiscussionForm';
import { threadAPI } from '../services/api';

function Community() {
  const { token } = useAuth();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    tags: [],
    sort: 'newest'
  });
  const hasFetched = useRef(false);

  // Fetch discussions from API
  useEffect(() => {
    // Prevent double-fetch in React StrictMode
    if (hasFetched.current) return;

    const fetchDiscussions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query params
        const params = {
          page: 1,
          limit: 50,
          sort: filters.sort === 'newest' ? '-createdAt' : 
                filters.sort === 'popular' ? '-likes' : 
                filters.sort === 'trending' ? '-views' : '-createdAt'
        };

        if (filters.category !== 'All') {
          params.category = filters.category;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await threadAPI.getAll(params);
        setDiscussions(response.data);
        hasFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch discussions:', err);
        setError('Failed to load discussions');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();

    return () => {
      hasFetched.current = false;
    };
  }, [filters.category, filters.sort, searchQuery]);

  // Handle new discussion submission
  const handleNewDiscussion = async (formData) => {
    try {
      // Map form data to match backend API expectations
      const threadData = {
        title: formData.title,
        content: formData.content,
        category: formData.type, // Map 'type' to 'category'
        tags: formData.tags
      };
      
      await threadAPI.create(token, threadData);
      setShowNewDiscussionForm(false);
      
      // Refresh discussions list
      hasFetched.current = false;
      const params = {
        page: 1,
        limit: 50,
        sort: '-createdAt'
      };
      
      const response = await threadAPI.getAll(params);
      setDiscussions(response.data);
      hasFetched.current = true;
    } catch (err) {
      console.error('Failed to create discussion:', err);
      alert('Failed to create discussion. Please try again.');
    }
  };

  // Filter discussions by tags (client-side filtering on top of API results)
  const filteredDiscussions = discussions.filter(discussion => {
    // Filter by tags
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        discussion.tags.some(discussionTag => 
          discussionTag.toLowerCase() === tag.toLowerCase()
        )
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="bg-dark-800 border-b border-dark-600 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Community Discussions</h1>
          <p className="text-gray-400 text-lg mb-8">Ask questions, share knowledge, and help fellow developers</p>
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="w-full bg-dark-700 border border-dark-600 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search discussions by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-6">
          <aside className={`transition-all duration-300 ${
            isFilterCollapsed ? 'w-16' : 'w-80'
          } flex-shrink-0`}>
            <CommunityFilter
              filters={filters}
              onFilterChange={setFilters}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  {filters.category === 'All' ? 'All Discussions' : filters.category}
                </h2>
                <span className="px-3 py-1 bg-dark-700 text-gray-400 rounded-full text-sm">({filteredDiscussions.length})</span>
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-900 rounded-lg font-medium hover:bg-primary-light transition-colors"
                onClick={() => setShowNewDiscussionForm(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Discussion
              </button>
            </div>            {filters.tags.length > 0 && (
              <div className="mb-6 flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm font-medium">Filtered by:</span>
                {filters.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm">
                    {tag}
                    <button
                      className="ml-1 hover:text-primary-light transition-colors"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          tags: filters.tags.filter(t => t !== tag)
                        });
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading discussions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  className="px-4 py-2 bg-primary text-dark-900 rounded-lg font-medium hover:bg-primary-light transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-white mb-2">No discussions found</h3>
                <p className="text-gray-400">Try adjusting your filters or be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiscussions.map(discussion => (
                  <DiscussionCard key={discussion._id} discussion={discussion} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* New Discussion Form Modal */}
      {showNewDiscussionForm && (
        <NewDiscussionForm
          onClose={() => setShowNewDiscussionForm(false)}
          onSubmit={handleNewDiscussion}
        />
      )}
    </div>
  );
}

export default Community;
