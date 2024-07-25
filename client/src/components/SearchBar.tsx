import React, { ChangeEvent } from 'react'


interface SearchBarProps {
  searchTerm: string;

  onSearch: (term: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchTerm }) => {

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value)
  }

  const handleClearClick = () => {
    onSearch(''); // Notify parent component that search term is cleared
  }

  return (
    <div>
      <div className="flex items-center">
        <input
          type="text"
          // value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search"
          className="px-4 h-10 w-80 border border-r-black border-white"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearClick}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <button
          // onClick={handleSearch}
          className="px-4  h-10 bg-green-600 rounded-sm text-white font-bold text-lg hover:bg-green-500"
        >
          Find
        </button>
      </div>

    </div>
  )
}

export default SearchBar
