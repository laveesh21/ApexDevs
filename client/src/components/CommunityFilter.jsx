import { useState } from 'react';
import './CommunityFilter.css';

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
    <div className={`community-filter ${isCollapsed ? 'collapsed' : ''}`}>
      {isCollapsed ? (
        <button className="filter-icon-btn" onClick={onToggleCollapse} title="Show Filters">
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
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="collapse-btn" onClick={onToggleCollapse}>
              ✕
            </button>
          </div>

          <div className="filter-content">
          {/* Clear Filters */}
          {(filters.category !== 'All' || filters.tags.length > 0 || filters.sort !== 'newest') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}

          {/* Sort Options */}
          <div className="filter-section">
            <h4>Sort By</h4>
            <div className="sort-options">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`sort-option ${filters.sort === option.value ? 'active' : ''}`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h4>Category</h4>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-item ${filters.category === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="filter-section">
            <h4>Popular Tags</h4>
            <div className="tags-list">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
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
