import { useState } from 'react';
import DiscussionCard from '../components/DiscussionCard';
import CommunityFilter from '../components/CommunityFilter';
import NewDiscussionForm from '../components/NewDiscussionForm';
import './Community.css';

function Community() {
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    tags: [],
    sort: 'newest'
  });

  // Sample community discussions data
  const allDiscussions = [
    {
      id: 1,
      type: 'Question',
      title: 'How to implement authentication in React with JWT?',
      excerpt: 'I\'m building a React application and need to implement user authentication using JWT tokens. What\'s the best approach for storing tokens and managing auth state?',
      author: 'Sarah Chen',
      votes: 45,
      answers: 8,
      views: 1234,
      tags: ['React', 'JavaScript', 'Authentication'],
      category: 'Questions',
      timeAgo: '2 hours ago',
      hasAcceptedAnswer: true
    },
    {
      id: 2,
      type: 'Discussion',
      title: 'Best practices for structuring a Node.js REST API',
      excerpt: 'What are the current best practices for organizing a Node.js REST API? Looking for advice on folder structure, middleware organization, and error handling patterns.',
      author: 'Michael Torres',
      votes: 78,
      answers: 12,
      views: 2456,
      tags: ['Node.js', 'JavaScript', 'API'],
      category: 'Discussions',
      timeAgo: '5 hours ago',
      hasAcceptedAnswer: true
    },
    {
      id: 3,
      type: 'Show & Tell',
      title: 'Built a real-time collaborative code editor',
      excerpt: 'Just finished building a real-time collaborative code editor using WebSockets and Monaco Editor. Check out the demo and let me know what you think!',
      author: 'Alex Kim',
      votes: 156,
      answers: 23,
      views: 3892,
      tags: ['JavaScript', 'WebSockets', 'React'],
      category: 'Show & Tell',
      timeAgo: '1 day ago',
      hasAcceptedAnswer: false
    },
    {
      id: 4,
      type: 'Question',
      title: 'MongoDB vs PostgreSQL for a social media app?',
      excerpt: 'I\'m starting a new social media project and can\'t decide between MongoDB and PostgreSQL. The app will have users, posts, comments, and real-time messaging. Any recommendations?',
      author: 'Emma Wilson',
      votes: 34,
      answers: 15,
      views: 987,
      tags: ['MongoDB', 'PostgreSQL', 'Database'],
      category: 'Questions',
      timeAgo: '3 hours ago',
      hasAcceptedAnswer: false
    },
    {
      id: 5,
      type: 'Tutorial',
      title: 'Complete guide to CSS Grid and Flexbox',
      excerpt: 'A comprehensive tutorial covering everything you need to know about CSS Grid and Flexbox. Includes practical examples and when to use each layout system.',
      author: 'David Martinez',
      votes: 203,
      answers: 7,
      views: 5621,
      tags: ['CSS', 'Frontend'],
      category: 'Tutorials',
      timeAgo: '2 days ago',
      hasAcceptedAnswer: false
    },
    {
      id: 6,
      type: 'Help Wanted',
      title: 'Help needed: Deploying Next.js app to Vercel',
      excerpt: 'Getting build errors when trying to deploy my Next.js application to Vercel. The app works fine locally but fails during the build process on Vercel.',
      author: 'Jessica Lee',
      votes: 12,
      answers: 3,
      views: 456,
      tags: ['Next.js', 'Deployment', 'Vercel'],
      category: 'Help Wanted',
      timeAgo: '4 hours ago',
      hasAcceptedAnswer: true
    },
    {
      id: 7,
      type: 'Question',
      title: 'TypeScript generic types confusion',
      excerpt: 'I\'m struggling to understand how to properly use generic types in TypeScript, especially with React components. Can someone explain with examples?',
      author: 'Chris Anderson',
      votes: 67,
      answers: 11,
      views: 1789,
      tags: ['TypeScript', 'React'],
      category: 'Questions',
      timeAgo: '6 hours ago',
      hasAcceptedAnswer: true
    },
    {
      id: 8,
      type: 'Discussion',
      title: 'State management: Redux vs Zustand vs Context API',
      excerpt: 'Let\'s discuss the pros and cons of different state management solutions in React. When should you use Redux, Zustand, or just stick with Context API?',
      author: 'Rachel Green',
      votes: 91,
      answers: 19,
      views: 2341,
      tags: ['React', 'State Management'],
      category: 'Discussions',
      timeAgo: '8 hours ago',
      hasAcceptedAnswer: false
    },
    {
      id: 9,
      type: 'Show & Tell',
      title: 'Created a Python script for automated testing',
      excerpt: 'Built a comprehensive Python automation script for testing web applications. Uses Selenium and pytest for E2E testing. Open source and ready to use!',
      author: 'Tom Brown',
      votes: 87,
      answers: 6,
      views: 1567,
      tags: ['Python', 'Testing', 'Automation'],
      category: 'Show & Tell',
      timeAgo: '12 hours ago',
      hasAcceptedAnswer: false
    },
    {
      id: 10,
      type: 'Discussion',
      title: 'Vue 3 Composition API vs Options API',
      excerpt: 'For those who have experience with both, which API do you prefer and why? Considering migrating a large Vue 2 project to Vue 3.',
      author: 'Lisa Wang',
      votes: 43,
      answers: 14,
      views: 1123,
      tags: ['Vue.js', 'JavaScript'],
      category: 'Discussions',
      timeAgo: '1 day ago',
      hasAcceptedAnswer: false
    },
    {
      id: 11,
      type: 'Bug Report',
      title: 'Bug: React useEffect running twice in development',
      excerpt: 'In React 18, my useEffect hook is running twice in development mode even with an empty dependency array. Is this expected behavior or a bug?',
      author: 'Kevin Zhang',
      votes: 28,
      answers: 5,
      views: 892,
      tags: ['React', 'JavaScript', 'Hooks'],
      category: 'Bug Reports',
      timeAgo: '7 hours ago',
      hasAcceptedAnswer: true
    },
    {
      id: 12,
      type: 'Question',
      title: 'Best resources for learning Docker and Kubernetes',
      excerpt: 'Looking for recommendations on the best tutorials, courses, or books for learning Docker and Kubernetes from scratch. Any suggestions?',
      author: 'Maria Garcia',
      votes: 56,
      answers: 10,
      views: 1456,
      tags: ['Docker', 'DevOps'],
      category: 'Questions',
      timeAgo: '10 hours ago',
      hasAcceptedAnswer: false
    }
  ];

  // Filter discussions
  const filteredDiscussions = allDiscussions.filter(discussion => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    if (filters.category !== 'All' && discussion.category !== filters.category) {
      return false;
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => discussion.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    return matchesSearch;
  }).sort((a, b) => {
    // Sort discussions
    switch (filters.sort) {
      case 'popular':
        return b.votes - a.votes;
      case 'trending':
        return b.views - a.views;
      case 'unanswered':
        return a.hasAcceptedAnswer - b.hasAcceptedAnswer;
      case 'newest':
      default:
        return 0; // Keep original order for newest
    }
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

          {filteredDiscussions.length === 0 ? (
            <div className="no-discussions">
              <h3>No discussions found</h3>
              <p>Try adjusting your filters or be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="discussions-list">
              {filteredDiscussions.map(discussion => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Discussion Form Modal */}
      {showNewDiscussionForm && (
        <NewDiscussionForm
          onClose={() => setShowNewDiscussionForm(false)}
          onSubmit={(formData) => {
            console.log('New discussion submitted:', formData);
            // Here you would typically send the data to your backend
            alert('Discussion posted successfully! (This is a demo)');
          }}
        />
      )}
    </div>
  );
}

export default Community;
