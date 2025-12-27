function Sort({ sortBy, onSortChange }) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' }
  ];

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sort By</h4>
      <div className="space-y-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === option.value
                ? 'bg-primary text-neutral-900'
                : 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sort;
