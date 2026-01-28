import { useState, useEffect, useRef } from 'react';

function OptionsMenu({ options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
        aria-label="Options"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 sm:w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-neutral-700 flex items-center gap-2 transition-colors ${
                option.danger ? 'text-red-400' : 'text-white'
              } ${
                index === 0 ? 'rounded-t-lg' : ''
              } ${
                index === options.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              {option.icon && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                </svg>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OptionsMenu;
