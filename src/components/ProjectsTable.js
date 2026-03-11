import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import './ProjectsTable.css';

const CopyIcon = ({ copied }) => copied ? (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
) : (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ProjectsTable = ({ projects, onView, onEdit, onDelete }) => {
  const toast = useToast();
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, fieldKey) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects found.</p>
      </div>
    );
  }

  return (
    <div className="projects-table-container">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Short Description</th>
            <th>Description</th>
            <th>Features</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td className="table-short-desc">{project.shortDescription || '-'}</td>
              <td className="table-description">
                {project.description ? (
                  <div className="table-cell-copy">
                    <div className="truncate-text" title={project.description}>
                      {project.description}
                    </div>
                    <button
                      type="button"
                      className={`btn-copy ${copiedField === `${project.id}-description` ? 'copied' : ''}`}
                      onClick={() => handleCopy(project.description, `${project.id}-description`)}
                      title="Copy description"
                    >
                      <CopyIcon copied={copiedField === `${project.id}-description`} />
                    </button>
                  </div>
                ) : '-'}
              </td>
              <td className="table-features">
                {project.feature ? (
                  <div className="table-cell-copy">
                    <div className="truncate-text" title={project.feature}>
                      {project.feature}
                    </div>
                    <button
                      type="button"
                      className={`btn-copy ${copiedField === `${project.id}-feature` ? 'copied' : ''}`}
                      onClick={() => handleCopy(project.feature, `${project.id}-feature`)}
                      title="Copy features"
                    >
                      <CopyIcon copied={copiedField === `${project.id}-feature`} />
                    </button>
                  </div>
                ) : '-'}
              </td>
              <td>
                {project.urls && project.urls.length > 0 ? (
                  <div className="table-urls">
                    {project.urls.map((url, index) => (
                      <div key={index} className="table-url-row">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-url"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          {project.urls.length > 1 ? `Link ${index + 1}` : 'Visit'}
                        </a>
                        <button
                          type="button"
                          className={`btn-copy ${copiedField === `${project.id}-url-${index}` ? 'copied' : ''}`}
                          onClick={() => handleCopy(url, `${project.id}-url-${index}`)}
                          title="Copy URL"
                        >
                          <CopyIcon copied={copiedField === `${project.id}-url-${index}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : '-'}
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn-action btn-action-view"
                    onClick={() => onView(project)}
                    title="View"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    className="btn-action btn-action-edit"
                    onClick={() => onEdit(project)}
                    title="Edit"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn-action btn-action-delete"
                    onClick={() => onDelete(project.id)}
                    title="Delete"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
