function SearchBar({ value, onChange, placeholder = "Search...", attachedButton = false }) {
  const handleClear = () => {
    onChange('');
  };

  const inputClasses = attachedButton
    ? "w-full bg-zinc-800/50 border border-neutral-700/50 rounded-l-lg rounded-r-none py-1.5 sm:py-2 md:py-2.5 pl-8 sm:pl-9 md:pl-10 pr-8 sm:pr-9 md:pr-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
    : "w-full bg-zinc-800/50 border border-neutral-700/50 rounded-lg py-1.5 sm:py-2 md:py-2.5 pl-8 sm:pl-9 md:pl-10 pr-8 sm:pr-9 md:pr-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="relative w-full">
      <svg 
        className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-gray-400" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button 
          className="absolute right-2 sm:right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base md:text-lg"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
