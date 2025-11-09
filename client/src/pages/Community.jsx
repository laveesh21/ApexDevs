import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DiscussionCard from '../components/DiscussionCard';
import CommunityFilter from '../components/CommunityFilter';
import NewDiscussionForm from '../components/NewDiscussionForm';
import { threadAPI } from '../services/api';
import './Community.css';

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
    <div className="community-container">
      <div className="community-header">
        <h1>Community Discussions</h1>
        <p>Ask questions, share knowledge, and help fellow developers</p>
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search discussions by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="community-layout">
        <aside className={`community-sidebar ${isFilterCollapsed ? 'collapsed' : ''}`}>
          <CommunityFilter
            filters={filters}
            onFilterChange={setFilters}
            isCollapsed={isFilterCollapsed}
            onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
          />
        </aside>

        <main className="community-main">
          <div className="discussions-header">
            <div className="discussions-header-left">
              <h2>
                {filters.category === 'All' ? 'All Discussions' : filters.category}
                <span className="discussions-count">({filteredDiscussions.length})</span>
              </h2>
            </div>
            <button 
              className="new-discussion-btn"
              onClick={() => setShowNewDiscussionForm(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Discussion
            </button>
          </div>
          
          {filters.tags.length > 0 && (
            <div className="active-tags">
              <span className="active-tags-label">Filtered by:</span>
              {filters.tags.map(tag => (
                <span key={tag} className="active-tag">
                  {tag}
                  <button
                    className="remove-tag"
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
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading discussions...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="no-discussions">
              <h3>No discussions found</h3>
              <p>Try adjusting your filters or be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="discussions-list">
              {filteredDiscussions.map(discussion => (
                <DiscussionCard key={discussion._id} discussion={discussion} />
              ))}
            </div>
          )}
        </main>
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
