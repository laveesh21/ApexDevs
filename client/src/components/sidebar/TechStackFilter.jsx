import PropTypes from 'prop-types';

const DEFAULT_TECH_STACKS = [
  'Angular', 'Bootstrap', 'CSS', 'Django', 'Docker', 'Express',
  'Firebase', 'Flask', 'GraphQL', 'HTML', 'Java', 'JavaScript',
  'Kotlin', 'MongoDB', 'MySQL', 'Next.js', 'Node.js', 'PHP',
  'PostgreSQL', 'Python', 'React', 'React Native', 'Redux',
  'Ruby', 'Rust', 'Spring Boot', 'SQL', 'Svelte', 'Swift',
  'Tailwind CSS', 'TypeScript', 'Vue.js'
];

/**
 * TechStackFilter - Component for filtering by technology stack
 * Displays tech options as toggleable tags
 */
function TechStackFilter({ selectedTech, onTechChange, techStacks = DEFAULT_TECH_STACKS }) {
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
    <div className="space-y-3">
      {selectedTech.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{selectedTech.length} selected</span>
          <button 
            onClick={clearFilters} 
            className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
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
    </div>
  );
}

TechStackFilter.propTypes = {
  selectedTech: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTechChange: PropTypes.func.isRequired,
  techStacks: PropTypes.arrayOf(PropTypes.string)
};

export default TechStackFilter;
