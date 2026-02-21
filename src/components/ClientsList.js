import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { clientsApi } from '../services/clientsApi';
import ConfirmModal from './ConfirmModal';
import ClientFormPage from './ClientFormPage';
import ClientsTable from './ClientsTable';
import './ClientsList.css';

const ACCOUNT_STATES = ['All', 'Active', 'Suspended', 'Verify', 'JSS', 'Rising Talent', 'Top Rated', 'Top Rated Plus'];

const ClientsList = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [newDraftId, setNewDraftId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const itemsPerPage = 10;

  const filteredClients = useMemo(() => {
    let result = clients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.country || '').toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'All') {
      result = result.filter(c => c.account_state === stateFilter);
    }
    return result;
  }, [clients, searchQuery, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [filteredClients.length, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stateFilter]);

  const handleAdd = async () => {
    if (!user?.id) return;
    setAdding(true);
    try {
      const client = await clientsApi.create(user.id, { full_name: '' });
      setSelectedClientId(client.id);
      setViewMode('edit');
      setNewDraftId(client.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClientId(client.id);
    setViewMode('edit');
  };

  const handleView = (client) => {
    setSelectedClientId(client.id);
    setViewMode('view');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedClientId(null);
    setNewDraftId(null);
    setCurrentPage(1);
    loadClients();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await clientsApi.delete(deleteId);
      loadClients();
      toast.success('Account deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
      setDeleteId(null);
    }
  };

  if (viewMode === 'edit' && selectedClientId) {
    return (
      <ClientFormPage
        clientId={selectedClientId}
        onSave={handleBack}
        onCancel={async () => {
          if (newDraftId === selectedClientId) {
            try {
              await clientsApi.delete(selectedClientId);
            } catch (e) { /* ignore */ }
          }
          handleBack();
        }}
      />
    );
  }

  if (viewMode === 'view' && selectedClientId) {
    return (
      <ClientViewPage
        clientId={selectedClientId}
        onEdit={() => setViewMode('edit')}
        onBack={handleBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="clients-list loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading accounts...</span>
      </div>
    );
  }

  const hasFilters = searchQuery || stateFilter !== 'All';

  return (
    <div className="clients-list">
      <div className="page-title-bar">
        <div className="page-title-left">
          <h2 className="page-title">Upwork Accounts</h2>
          <span className="page-count">{clients.length} {clients.length === 1 ? 'account' : 'accounts'}</span>
        </div>
        <button type="button" className="btn btn-primary btn-new-project" onClick={handleAdd} disabled={adding}>
          {adding ? (
            <>
              <span className="btn-spinner" />
              Creating...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Account
            </>
          )}
        </button>
      </div>

      {clients.length > 0 && (
        <div className="clients-toolbar">
          <div className="toolbar-filters">
            <div className="search-row">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, title..."
                className="search-input"
              />
            </div>
            <select
              className="filter-select"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              {ACCOUNT_STATES.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              type="button"
              className="btn-clear"
              onClick={() => { setSearchQuery(''); setStateFilter('All'); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          )}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="clients-empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="empty-state-title">No accounts yet</h3>
          <p className="empty-state-text">Add Upwork accounts to manage profiles, portfolios, and proxy info.</p>
          <button type="button" className="btn btn-primary" onClick={handleAdd}>
            Add your first account
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="clients-empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="empty-state-title">No matching accounts</h3>
          <p className="empty-state-text">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <>
          <ClientsTable
            clients={paginatedClients}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDeleteId}
          />
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Previous
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
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Account"
        message="Are you sure you want to delete this Upwork account? All information will be removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

const ClientViewPage = ({ clientId, onEdit, onBack }) => {
  const toast = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      clientsApi.getById(clientId).then(setClient).catch(console.error).finally(() => setLoading(false));
    }
  }, [clientId]);

  if (loading || !client) {
    return (
      <div className="clients-list loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : null);
  const formatEducationText = (edu) => {
    if (!edu || !Array.isArray(edu)) return null;
    if (typeof edu[0] === 'string') return edu[0];
    return edu.map((e) => e.description || `${e.institution || ''} ${e.degree || ''}`.trim() || '').filter(Boolean).join('\n\n') || null;
  };
  const formatWorkText = (work) => {
    if (!work || !Array.isArray(work)) return null;
    if (typeof work[0] === 'string') return work[0];
    return work.map((w) => w.description || `${w.company || ''} - ${w.role || ''}`.trim() || '').filter(Boolean).join('\n\n') || null;
  };
  const formatAddress = (addr) => {
    if (!addr) return null;
    try {
      const o = typeof addr === 'string' ? JSON.parse(addr) : addr;
      const parts = [o.street, o.apt, o.city, o.state, o.zip].filter(Boolean);
      return parts.length ? parts.join(', ') : null;
    } catch {
      return addr;
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const hasContactInfo =
    client.birthday ||
    client.phone_number ||
    client.country ||
    formatAddress(client.address);
  const hasSidebarContact = client.phone_number || client.country;

  return (
    <div className="client-view-page">
      <header className="client-view-header">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </header>

      <div className="client-view-layout">
        <aside className="client-view-sidebar">
          <div className="client-view-profile-card">
            <div className="client-avatar">
              {client.image_url ? (
                <img src={client.image_url} alt={client.full_name || 'Client'} />
              ) : (
                <div className="avatar-placeholder">
                  {(client.full_name || client.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="client-name">{client.full_name || 'No name'}</h2>
            {client.title && <p className="client-title">{client.title}</p>}
            {client.email && (
              <a href={`mailto:${client.email}`} className="client-email">
                {client.email}
              </a>
            )}
            {client.password && (
              <div className="client-password-row">
                <span className="password-masked">••••••••</span>
                <button
                  type="button"
                  className="btn-copy-sm"
                  onClick={() => copyText(client.password, 'Password')}
                  title="Copy password"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            )}
            {client.account_state && (
              <div className="client-account-state">
                <span className={`account-state-badge state-${(client.account_state || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {client.account_state}
                </span>
              </div>
            )}
            {hasSidebarContact && (
              <div className="client-sidebar-contact">
                {client.phone_number && (
                  <a href={`tel:${client.phone_number}`} className="contact-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {client.phone_number}
                  </a>
                )}
                {client.country && (
                  <span className="contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {client.country}
                  </span>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="client-view-main">
          {client.title && (
            <section className="client-view-section">
              <h3>Title</h3>
              <p className="client-text-block">{client.title}</p>
            </section>
          )}

          {client.description && (
            <section className="client-view-section">
              <h3>Description</h3>
              <p className="client-text-block">{client.description}</p>
            </section>
          )}

          {hasContactInfo && (
            <section className="client-view-section">
              <h3>Contact Details</h3>
              <div className="client-details-grid">
                {client.birthday && (
                  <div className="client-detail">
                    <span className="detail-label">Birthday</span>
                    <span className="detail-value">{formatDate(client.birthday)}</span>
                  </div>
                )}
                {client.phone_number && (
                  <div className="client-detail">
                    <span className="detail-label">Phone</span>
                    <a href={`tel:${client.phone_number}`} className="detail-value">
                      {client.phone_number}
                    </a>
                  </div>
                )}
                {client.country && (
                  <div className="client-detail">
                    <span className="detail-label">Country</span>
                    <span className="detail-value">{client.country}</span>
                  </div>
                )}
                {formatAddress(client.address) && (
                  <div className="client-detail full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{formatAddress(client.address)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {formatEducationText(client.education) && (
            <section className="client-view-section">
              <h3>Education</h3>
              <p className="client-text-block">{formatEducationText(client.education)}</p>
            </section>
          )}

          {formatWorkText(client.work_experience) && (
            <section className="client-view-section">
              <h3>Work Experience</h3>
              <p className="client-text-block">{formatWorkText(client.work_experience)}</p>
            </section>
          )}

          {client.tech_stack?.length > 0 && (
            <section className="client-view-section">
              <h3>Tech Stack</h3>
              <div className="client-tech-stack">
                {client.tech_stack.map((t, j) => (
                  <span key={j} className="tech-tag">{t}</span>
                ))}
              </div>
            </section>
          )}

          {client.portfolios?.length > 0 && (
            <section className="client-view-section">
              <h3>Portfolio</h3>
              <div className="client-portfolios">
                {client.portfolios.map((pf, i) => (
                  <div key={i} className="portfolio-item">
                    {pf.images?.length > 0 && (
                      <div className="portfolio-images">
                        {pf.images.map((img, j) => (
                          <img key={j} src={img} alt={pf.title || 'Portfolio'} />
                        ))}
                      </div>
                    )}
                    {pf.title && <h4>{pf.title}</h4>}
                    {pf.description && <p>{pf.description}</p>}
                    {pf.tech_stack?.length > 0 && (
                      <div className="portfolio-tech">
                        {pf.tech_stack.map((t, j) => (
                          <span key={j} className="tech-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {client.proxy_info && (client.proxy_info.type || client.proxy_info.ip || client.proxy_info.username) && (
            <section className="client-view-section">
              <h3>Proxy Info</h3>
              <div className="client-details-grid">
                {client.proxy_info.type && (
                  <div className="client-detail">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{client.proxy_info.type}</span>
                  </div>
                )}
                {client.proxy_info.timeline && (
                  <div className="client-detail">
                    <span className="detail-label">Timeline</span>
                    <span className="detail-value">{client.proxy_info.timeline}</span>
                  </div>
                )}
                {client.proxy_info.ip && (
                  <div className="client-detail">
                    <span className="detail-label">IP</span>
                    <span className="detail-value">{client.proxy_info.ip}</span>
                  </div>
                )}
                {client.proxy_info.port && (
                  <div className="client-detail">
                    <span className="detail-label">Port</span>
                    <span className="detail-value">{client.proxy_info.port}</span>
                  </div>
                )}
                {client.proxy_info.username && (
                  <div className="client-detail">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">{client.proxy_info.username}</span>
                  </div>
                )}
                {client.proxy_info.password && (
                  <div className="client-detail client-password-detail">
                    <span className="detail-label">Password</span>
                    <span className="detail-value password-masked">••••••••</span>
                    <button
                      type="button"
                      className="btn-copy-sm"
                      onClick={() => copyText(client.proxy_info.password, 'Proxy password')}
                      title="Copy"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {(client.comment || client.summary) && (
            <section className="client-view-section">
              <h3>My Opinion</h3>
              <p className="client-summary-text">{client.comment || client.summary}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientsList;
