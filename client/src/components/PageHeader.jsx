import SearchBar from './SearchBar';
import Button from './ui/Button';

function PageHeader({ 
  title, 
  description, 
  searchValue, 
  onSearchChange, 
  searchPlaceholder,
  actionButton 
}) {
  const handleSearch = () => {
    // Search is reactive through onChange, this button is for visual UX
    console.log('Search triggered:', searchValue);
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 py-4 sm:py-6 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-gray-400 text-xs sm:text-sm">{description}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 flex gap-0 w-full">
            <div className="flex-1">
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                attachedButton={true}
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="zinc_secondary"
              size="xs"
              className="border-l-0 rounded-l-none rounded-r-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
              icon={
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2"/>
                </svg>
              }
              aria-label="Search"
            />
          </div>
          {actionButton && (
            <div className="hidden sm:block sm:w-auto sm:ml-3">
              {actionButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
