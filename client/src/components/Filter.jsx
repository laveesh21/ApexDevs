
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
    <div className={`bg-neutral-800 border border-neutral-600 rounded-xl transition-all duration-300 ${
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filter by Tech Stack</h3>
            <button 
              className="text-gray-400 hover:text-white transition-colors text-xl" 
              onClick={onToggleCollapse}
            >
              ✕
            </button>
          </div>
          
          {selectedTech.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-sm font-medium text-primary">
                {selectedTech.length} selected
              </div>
              <button 
                onClick={clearFilters} 
                className="text-sm text-primary hover:text-primary-light transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {techStacks.map((tech) => (
              <button
                key={tech}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedTech.includes(tech) 
                    ? 'bg-primary text-neutral-900' 
                    : 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-white'
                }`}
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
