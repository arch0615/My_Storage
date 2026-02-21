import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import './ProjectCard.css';

const CopyIcon = ({ copied }) => copied ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
  const toast = useToast();
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-badges">
          <span className="badge badge-type">{project.type?.name}</span>
          <span className="badge badge-division">{project.division?.name}</span>
        </div>
        <div className="project-actions">
          <button className="btn-action btn-action-view" onClick={() => onView(project)} title="View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button className="btn-action btn-action-edit" onClick={() => onEdit(project)} title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="btn-action btn-action-delete" onClick={() => onDelete(project.id)} title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="project-card-body">
        {project.shortDescription && (
          <h3 className="project-title">{project.shortDescription}</h3>
        )}
        {project.description && (
          <div className="project-copyable">
            <p className="project-description">{project.description}</p>
            <button
              type="button"
              className={`btn-copy ${copiedField === 'description' ? 'copied' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleCopy(project.description, 'description'); }}
              title="Copy description"
            >
              <CopyIcon copied={copiedField === 'description'} />
            </button>
          </div>
        )}
        {project.urls && project.urls.length > 0 && (
          <div className="project-urls">
            {project.urls.map((url, index) => (
              <div key={index} className="project-url-row">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-url"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Visit {project.urls.length > 1 ? `(${index + 1})` : 'Project'}
                </a>
                <button
                  type="button"
                  className={`btn-copy ${copiedField === `url-${index}` ? 'copied' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleCopy(url, `url-${index}`); }}
                  title="Copy URL"
                >
                  <CopyIcon copied={copiedField === `url-${index}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {project.feature && (
        <div className="project-card-footer">
          <div className="project-feature">
            <strong>Features:</strong>
            <div className="project-copyable">
              <p>{project.feature}</p>
              <button
                type="button"
                className={`btn-copy ${copiedField === 'feature' ? 'copied' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleCopy(project.feature, 'feature'); }}
                title="Copy features"
              >
                <CopyIcon copied={copiedField === 'feature'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
