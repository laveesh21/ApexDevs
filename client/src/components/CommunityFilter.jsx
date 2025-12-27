import { useState } from 'react';

function CommunityFilter({ filters, onFilterChange, isCollapsed, onToggleCollapse }) {
  const categories = [
    'All',
    'Questions',
    'Discussions',
    'Tutorials',
    'Show & Tell',
    'Help Wanted',
    'Bug Reports'
  ];

  const popularTags = [
    'JavaScript',
    'React',
    'Python',
    'Node.js',
    'CSS',
    'MongoDB',
    'TypeScript',
    'Next.js',
    'Vue.js',
    'Django'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'unanswered', label: 'Unanswered' }
  ];

  const handleCategoryChange = (category) => {
    onFilterChange({ ...filters, category });
  };

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleSortChange = (sort) => {
    onFilterChange({ ...filters, sort });
  };

  const clearFilters = () => {
    onFilterChange({ category: 'All', tags: [], sort: 'newest' });
  };

  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl transition-all duration-300 ${
      isCollapsed ? 'p-2' : 'p-6'
    }`}>
      {isCollapsed ? (
        <button 
          className="w-full p-2 text-primary hover:text-primary-light transition-colors" 
          onClick={onToggleCollapse} 
          title="Show Filters"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="7" cy="6" r="2" fill="currentColor"/>
            <circle cx="14" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button 
              className="text-gray-400 hover:text-white transition-colors text-xl" 
              onClick={onToggleCollapse}
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Clear Filters */}
            {(filters.category !== 'All' || filters.tags.length > 0 || filters.sort !== 'newest') && (
              <button 
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium text-sm" 
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}

            {/* Sort Options */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Sort By</h4>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      filters.sort === option.value 
                        ? 'bg-primary text-dark-900' 
                        : 'bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary hover:text-white'
                    }`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      filters.category === category 
                        ? 'bg-primary text-dark-900' 
                        : 'bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary hover:text-white'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.tags.includes(tag) 
                        ? 'bg-primary text-dark-900' 
                        : 'bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary hover:text-white'
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CommunityFilter;
