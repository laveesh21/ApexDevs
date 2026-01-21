import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import ActiveFilters from '../components/ActiveFilters';
import { Sidebar, SidebarSection, SortFilter, TechStackFilter } from '../components/sidebar';
import SearchBar from '../components/SearchBar';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import NewProjectForm from '../components/NewProjectForm';
import { projectAPI } from '../services/api';

function Homepage() {
  const [selectedTech, setSelectedTech] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const itemsPerPage = 40;

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery, selectedTech, sortBy]);

  // Listen for mobile filter toggle event
  useEffect(() => {
    const handleToggleFilters = () => {
      setShowMobileFilters(prev => !prev);
    };
    window.addEventListener('toggleMobileFilters', handleToggleFilters);
    return () => window.removeEventListener('toggleMobileFilters', handleToggleFilters);
  }, []);

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

      // Apply sorting
      fetchedProjects = sortProjects(fetchedProjects, sortBy);

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

  const sortProjects = (projectsList, sortType) => {
    const sorted = [...projectsList];
    
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'popular':
        return sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      case 'views':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return sorted;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveTech = (tech) => {
    setSelectedTech(selectedTech.filter(t => t !== tech));
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex">
      {/* Left Sidebar with Filters */}
      <Sidebar
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        title="Filters & Sort"
      >
        <SidebarSection title="Sort By">
          <SortFilter 
            sortBy={sortBy} 
            onSortChange={setSortBy}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'views', label: 'Most Viewed' }
            ]}
          />
        </SidebarSection>
        
        <SidebarSection title="Tech Stack" showDivider>
          <TechStackFilter 
            selectedTech={selectedTech} 
            onTechChange={setSelectedTech}
          />
        </SidebarSection>
      </Sidebar>

      {/* Mobile Filter Drawer Overlay */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-neutral-900 border-r border-neutral-700 z-50 transform transition-transform duration-300 md:hidden overflow-y-auto ${
        showMobileFilters ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <button 
            onClick={() => setShowMobileFilters(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <SidebarSection title="Sort By">
            <SortFilter
              sortBy={sortBy} 
              onSortChange={setSortBy}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'views', label: 'Most Viewed' }
              ]}
            />
          </SidebarSection>
          
          <SidebarSection title="Tech Stack" showDivider>
            <TechStackFilter 
              selectedTech={selectedTech} 
              onTechChange={setSelectedTech}
            />
          </SidebarSection>
        </div>
      </div>

      {/* Main Content - Adjusted with left margin */}
      <div className={`flex-1 transition-all duration-300 ${
        isFilterCollapsed ? 'md:ml-16' : 'md:ml-72'
      }`}>

        {/* Floating Add Project Button - Mobile Only */}
        <button
          onClick={() => setShowProjectForm(true)}
          className="md:hidden fixed bottom-20 right-4 z-30 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
          aria-label="Add Project"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <PageHeader
          title="Discover Amazing Projects"
          description="Browse through developer projects and get inspired"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search projects by title, description, or author..."
          actionButton={
            <Button
              onClick={() => setShowProjectForm(true)}
              variant="primary"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Project
            </Button>
          }
        />

        <div className="max-w-6xl mx-auto py-2 sm:py-4 md:py-8 px-1 sm:px-2 md:px-4">
          <ActiveFilters
            selectedTags={selectedTech}
            onRemoveTag={handleRemoveTech}
            label="Filtered by"
          />
          
          <main className="w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No projects found</h2>
                <p className="text-gray-400">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-gray-400">
                  Showing {projects.length} of {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
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
                                  ? 'bg-primary text-white' 
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

      {showProjectForm && (
        <NewProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}

export default Homepage;
