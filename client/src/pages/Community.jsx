import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DiscussionCard from '../components/DiscussionCard';
import ActiveFilters from '../components/ActiveFilters';
import { Sidebar, SidebarSection, SortFilter, CategoryFilter, TagFilter } from '../components/sidebar';
import NewDiscussionForm from '../components/NewDiscussionForm';
import SearchBar from '../components/SearchBar';
import PageHeader from '../components/PageHeader';
import { threadAPI } from '../services/api';
import { Tag, Button } from '../components/ui';

function Community() {
  const { token } = useAuth();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const handleTagChange = (tags) => {
    setFilters({ ...filters, tags });
  };

  const handleSortChange = (sort) => {
    setFilters({ ...filters, sort });
  };

  const handleRemoveTag = (tag) => {
    setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) });
  };

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
    <div className="min-h-screen bg-neutral-900 flex">
      {/* Left Sidebar with Filters */}
      <Sidebar
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        title="Filters & Sort"
      >
        <SidebarSection title="Sort By">
          <SortFilter 
            sortBy={filters.sort} 
            onSortChange={handleSortChange}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'trending', label: 'Trending' }
            ]}
          />
        </SidebarSection>
        
        <SidebarSection title="Category" showDivider>
          <CategoryFilter 
            selectedCategory={filters.category} 
            onCategoryChange={handleCategoryChange}
            categories={[
              { value: 'All', label: 'All Categories' },
              { value: 'General', label: 'General Discussion' },
              { value: 'Help', label: 'Help & Support' },
              { value: 'Showcase', label: 'Project Showcase' },
              { value: 'Feedback', label: 'Feedback' }
            ]}
          />
        </SidebarSection>

        <SidebarSection title="Tags" showDivider>
          <TagFilter 
            selectedTags={filters.tags} 
            onTagChange={handleTagChange}
            tags={['React', 'JavaScript', 'Python', 'TypeScript', 'Node.js', 'Tutorial', 'Question', 'Discussion', 'Bug', 'Feature']}
          />
        </SidebarSection>
      </Sidebar>

      {/* Mobile Filter Drawer Overlay */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-neutral-900 border-r border-neutral-700 z-50 transform transition-transform duration-300 md:hidden overflow-y-auto ${
        showMobileFilters ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <button 
            onClick={() => setShowMobileFilters(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <SidebarSection title="Sort By">
            <SortFilter 
              sortBy={filters.sort} 
              onSortChange={handleSortChange}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'trending', label: 'Trending' }
              ]}
            />
          </SidebarSection>
          
          <SidebarSection title="Category" showDivider>
            <CategoryFilter 
              selectedCategory={filters.category} 
              onCategoryChange={handleCategoryChange}
              categories={[
                { value: 'All', label: 'All Categories' },
                { value: 'General', label: 'General Discussion' },
                { value: 'Help', label: 'Help & Support' },
                { value: 'Showcase', label: 'Project Showcase' },
                { value: 'Feedback', label: 'Feedback' }
              ]}
            />
          </SidebarSection>

          <SidebarSection title="Tags" showDivider>
            <TagFilter 
              selectedTags={filters.tags} 
              onTagChange={handleTagChange}
              tags={['React', 'JavaScript', 'Python', 'TypeScript', 'Node.js', 'Tutorial', 'Question', 'Discussion', 'Bug', 'Feature']}
            />
          </SidebarSection>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isFilterCollapsed ? 'md:ml-16' : 'md:ml-72'
      }`}>
        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden fixed bottom-4 right-4 z-40 bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>

        <PageHeader
          title="Community Discussions"
          description="Ask questions, share knowledge, and help fellow developers"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search discussions by title, content, or author..."
          actionButton={
            <Button
              onClick={() => setShowNewDiscussionForm(true)}
              variant="zinc_secondary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Thread
            </Button>
          }
        />

        <div className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
          <ActiveFilters
            selectedTags={filters.tags}
            onRemoveTag={handleRemoveTag}
            label="Filtered by"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {filters.category === 'All' ? 'All Discussions' : filters.category}
              </h2>
              <span className="px-2 py-0.5 sm:py-1 bg-neutral-700 text-gray-400 rounded-full text-xs">({filteredDiscussions.length})</span>
            </div>
          </div>
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading discussions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  className="px-4 py-2 bg-primary text-white border border-primary rounded-lg font-medium hover:bg-primary-light transition-colors"
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
