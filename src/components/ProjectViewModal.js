import React, { useState } from 'react';
import './ProjectViewModal.css';

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CopyIconBtn = ({ copied, onClick, title }) => (
  <button
    className={`icon-btn copy-icon-btn ${copied ? 'copied' : ''}`}
    onClick={onClick}
    title={copied ? 'Copied!' : title}
  >
    {copied ? <IconCheck /> : <IconCopy />}
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

  const title = project.shortDescription || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="view-modal-header">
          <div className="view-header-meta">
            {project.type && <span className="badge badge-type">{project.type.name}</span>}
            {project.division && <span className="badge badge-division">{project.division.name}</span>}
          </div>
          <button className="icon-btn btn-close-modal" onClick={onClose} title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {title && (
          <div className="view-modal-title">
            <h2>{title}</h2>
          </div>
        )}

        {/* Body */}
        <div className="view-modal-body">

          {/* URLs */}
          {project.urls && project.urls.length > 0 && (
            <div className="view-section">
              <div className="view-section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                URLs
              </div>
              <div className="view-urls-list">
                {project.urls.map((url, index) => (
                  <div key={index} className="view-url-card">
                    <span className="view-url-index">{index + 1}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-url-text"
                      title={url}
                    >
                      {url}
                    </a>
                    <div className="view-url-actions">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-btn open-link-btn"
                        title="Open in new tab"
                      >
                        <IconExternalLink />
                      </a>
                      <CopyIconBtn
                        copied={copiedField === `url-${index}`}
                        onClick={() => handleCopy(url, `url-${index}`)}
                        title="Copy URL"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="view-section">
              <div className="view-section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="17" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="13" y1="18" x2="3" y2="18" />
                </svg>
                Description
                <CopyIconBtn
                  copied={copiedField === 'description'}
                  onClick={() => handleCopy(project.description, 'description')}
                  title="Copy description"
                />
              </div>
              <div className="view-text-block">{project.description}</div>
            </div>
          )}

          {/* Features */}
          {project.feature && (
            <div className="view-section">
              <div className="view-section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Features
                <CopyIconBtn
                  copied={copiedField === 'feature'}
                  onClick={() => handleCopy(project.feature, 'feature')}
                  title="Copy features"
                />
              </div>
              <div className="view-text-block">{project.feature}</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="view-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => { onClose(); onEdit(project); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
