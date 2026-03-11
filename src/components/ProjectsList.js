import React, { useState, useEffect, useMemo } from 'react';
import { projectsAPI, typesAPI, divisionsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProjectsTable from './ProjectsTable';
import ProjectModal from './ProjectModal';
import ProjectViewModal from './ProjectViewModal';
import CategorySidebar from './CategorySidebar';
import ConfirmModal from './ConfirmModal';
import './ProjectsList.css';

const ProjectsList = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  // Single category filter: '' | 'type:{id}' | 'division:{id}'
  const [activeFilterCategory, setActiveFilterCategory] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilterCategory, activeSearchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, typesRes, divisionsRes] = await Promise.all([
        projectsAPI.getAll(),
        typesAPI.getAll(),
        divisionsAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setTypes(typesRes.data);
      setDivisions(divisionsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleView = (project) => {
    setViewingProject(project);
    setIsViewModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => setDeleteConfirm({ id });

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await projectsAPI.delete(deleteConfirm.id);
      loadData();
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      setDeleteConfirm(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingProject(null);
  };

  const handleModalSave = () => {
    loadData();
    handleModalClose();
  };

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchQuery('');
    setCurrentPage(1);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      let matchesCategory = true;
      if (activeFilterCategory.includes('/division:')) {
        // Combined type+division selection: "type:{typeId}/division:{divId}"
        const [typePart, divPart] = activeFilterCategory.split('/');
        const typeId = parseInt(typePart.replace('type:', ''));
        const divisionId = parseInt(divPart.replace('division:', ''));
        matchesCategory = project.typeId === typeId && project.divisionId === divisionId;
      } else if (activeFilterCategory.startsWith('type:')) {
        const typeId = parseInt(activeFilterCategory.replace('type:', ''));
        matchesCategory = project.typeId === typeId;
      }
      const searchLower = activeSearchQuery.toLowerCase();
      const matchesSearch = !activeSearchQuery ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.feature && project.feature.toLowerCase().includes(searchLower));
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeFilterCategory, activeSearchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading projects...</span>
      </div>
    );
  }

  const hasActiveSearch = !!activeSearchQuery;

  return (
    <div className="projects-list">
      <div className="projects-layout">
        {/* Left sidebar — category tree */}
        <CategorySidebar
          value={activeFilterCategory}
          onChange={(val) => {
            setActiveFilterCategory(val);
            setCurrentPage(1);
          }}
          types={types}
          divisions={divisions}
        />

        {/* Right content area */}
        <div className="projects-content">
          <div className="page-title-bar">
            <div className="page-title-left">
              <h2 className="page-title">Projects</h2>
              <span className="page-count">{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}</span>
            </div>
            <button className="btn btn-primary btn-new-project" onClick={handleCreate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </button>
          </div>

          <section className="projects-toolbar" aria-label="Search projects">
            <div className="toolbar-filters">
              <div className="search-row">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search description and features..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                  aria-label="Search in description and features"
                />
              </div>
            </div>
            <div className="toolbar-actions">
              <button className="btn btn-search" onClick={handleSearch}>Search</button>
              {hasActiveSearch && (
                <button className="btn btn-clear" onClick={handleClearSearch}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </section>

          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="empty-state-title">No projects found</h3>
              <p className="empty-state-text">
                {activeFilterCategory || hasActiveSearch
                  ? 'Try adjusting your search or category filter.'
                  : 'Get started by creating your first project.'}
              </p>
              {!activeFilterCategory && !hasActiveSearch && (
                <button className="btn btn-primary" onClick={handleCreate}>
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <>
              <ProjectsTable
                projects={paginatedProjects}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isViewModalOpen && (
        <ProjectViewModal
          project={viewingProject}
          onClose={handleViewModalClose}
          onEdit={handleEdit}
        />
      )}

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          types={types}
          divisions={divisions}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default ProjectsList;
