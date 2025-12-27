import { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import Filter from '../components/Filter';
import { projectAPI } from '../services/api';

function Homepage() {
  const [selectedTech, setSelectedTech] = useState([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const itemsPerPage = 40;

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery, selectedTech]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedTech.length > 0) {
        // API expects single technology filter, so we'll filter on frontend for multiple
        params.technology = selectedTech[0];
      }

      const response = await projectAPI.getAll(params);
      
      // If multiple tech filters, filter on frontend (case-insensitive)
      let fetchedProjects = response.data || [];
      if (selectedTech.length > 1) {
        fetchedProjects = fetchedProjects.filter(project => 
          selectedTech.every(tech => 
            project.technologies?.some(projectTech => 
              projectTech.toLowerCase() === tech.toLowerCase()
            )
          )
        );
      }

      setProjects(fetchedProjects);
      setTotalPages(response.pagination?.pages || 1);
      setTotalProjects(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="bg-neutral-800 border-b border-neutral-600 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Discover Amazing Projects</h1>
          <p className="text-gray-400 text-lg mb-8">Browse through developer projects and get inspired</p>
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="w-full bg-neutral-700 border border-neutral-600 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search projects by title, description, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-6">
          <aside className={`transition-all duration-300 ${
            isFilterCollapsed ? 'w-16' : 'w-80'
          } flex-shrink-0`}>
            <Filter 
              selectedTech={selectedTech} 
              onTechChange={setSelectedTech}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-2">No projects found</h2>
                <p className="text-gray-400">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-gray-400">
                  Showing {projects.length} of {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button 
                      className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white hover:bg-neutral-600 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                page === currentPage 
                                  ? 'bg-primary text-neutral-900' 
                                  : 'bg-neutral-700 text-white border border-neutral-600 hover:bg-neutral-600 hover:border-primary'
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="text-gray-400 px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button 
                      className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white hover:bg-neutral-600 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
            </>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
