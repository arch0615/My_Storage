import React, { useState } from 'react';
import './ProjectViewModal.css';

const CopyButton = ({ copied, onClick, label }) => (
  <button
    className={`copy-btn ${copied ? 'copied' : ''}`}
    onClick={onClick}
    title={label}
  >
    {copied ? (
      <>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Copied
      </>
    ) : (
      <>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy
      </>
    )}
  </button>
);

const ProjectViewModal = ({ project, onClose, onEdit }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!project) return null;

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Project Details</h2>
            {(project.type || project.division) && (
              <div className="view-header-badges">
                {project.type && <span className="badge badge-type">{project.type.name}</span>}
                {project.division && <span className="badge badge-division">{project.division.name}</span>}
              </div>
            )}
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="view-modal-body">
          <div className="view-section">
            {project.urls && project.urls.length > 0 && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">URLs</div>
                </div>
                <div className="view-urls-list">
                  {project.urls.map((url, index) => (
                    <div key={index} className="view-url-item">
                      <svg className="view-url-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <div className="view-url-content">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-url"
                        >
                          {url}
                        </a>
                      </div>
                      <CopyButton
                        copied={copiedField === `url-${index}`}
                        onClick={() => handleCopy(url, `url-${index}`)}
                        label="Copy URL"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.description && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">Description</div>
                  <CopyButton
                    copied={copiedField === 'description'}
                    onClick={() => handleCopy(project.description, 'description')}
                    label="Copy description"
                  />
                </div>
                <div className="view-value view-text">{project.description}</div>
              </div>
            )}

            {project.feature && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">Features</div>
                  <CopyButton
                    copied={copiedField === 'feature'}
                    onClick={() => handleCopy(project.feature, 'feature')}
                    label="Copy features"
                  />
                </div>
                <div className="view-value view-text">{project.feature}</div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => {
              onClose();
              onEdit(project);
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectViewModal;
