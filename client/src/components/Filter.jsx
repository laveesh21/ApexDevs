import './Filter.css';

function Filter({ selectedTech, onTechChange, isCollapsed, onToggleCollapse }) {
  const techStacks = [
    'Angular',
    'Bootstrap',
    'CSS',
    'Django',
    'Docker',
    'Express',
    'Firebase',
    'Flask',
    'GraphQL',
    'HTML',
    'Java',
    'JavaScript',
    'Kotlin',
    'MongoDB',
    'MySQL',
    'Next.js',
    'Node.js',
    'PHP',
    'PostgreSQL',
    'Python',
    'React',
    'React Native',
    'Redux',
    'Ruby',
    'Rust',
    'Spring Boot',
    'SQL',
    'Svelte',
    'Swift',
    'Tailwind CSS',
    'TypeScript',
    'Vue.js'
  ];

  const handleTechToggle = (tech) => {
    if (selectedTech.includes(tech)) {
      onTechChange(selectedTech.filter(t => t !== tech));
    } else {
      onTechChange([...selectedTech, tech]);
    }
  };

  const clearFilters = () => {
    onTechChange([]);
  };

  return (
    <div className={`filter-container ${isCollapsed ? 'collapsed' : ''}`}>
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
            <h3>Filter by Tech Stack</h3>
            <button className="collapse-btn" onClick={onToggleCollapse}>
              ✕
            </button>
          </div>
          
          {selectedTech.length > 0 && (
            <div className="selected-info">
              <div className="selected-count">
                {selectedTech.length} selected
              </div>
              <button onClick={clearFilters} className="clear-button">
                Clear All
              </button>
            </div>
          )}

          <div className="filter-list">
            {techStacks.map((tech) => (
              <button
                key={tech}
                className={`filter-chip ${selectedTech.includes(tech) ? 'selected' : ''}`}
                onClick={() => handleTechToggle(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Filter;
