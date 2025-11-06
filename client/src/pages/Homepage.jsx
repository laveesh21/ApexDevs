import { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import Filter from '../components/Filter';
import { projectAPI } from '../services/api';
import './Homepage.css';

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
      
      // If multiple tech filters, filter on frontend
      let fetchedProjects = response.data || [];
      if (selectedTech.length > 1) {
        fetchedProjects = fetchedProjects.filter(project => 
          selectedTech.every(tech => project.technologies?.includes(tech))
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
    <div className="homepage">
      <div className="homepage-header">
        <h1>Discover Amazing Projects</h1>
        <p>Browse through developer projects and get inspired</p>
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by title, description, or author..."
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

      <div className="homepage-container">
        <aside className={`homepage-sidebar ${isFilterCollapsed ? 'collapsed' : ''}`}>
          <Filter 
            selectedTech={selectedTech} 
            onTechChange={setSelectedTech}
            isCollapsed={isFilterCollapsed}
            onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
          />
        </aside>

        <main className="homepage-main">
          {loading ? (
            <div className="projects-loading">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="no-projects">
              <h2>No projects found</h2>
              <p>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <>
              <div className="results-info">
                Showing {projects.length} of {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
              </div>
              <div className="projects-grid">
                {projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-numbers">
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
                            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button 
                    className="pagination-btn"
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
  );
}

export default Homepage;
