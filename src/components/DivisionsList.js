import React, { useState, useEffect } from 'react';
import { divisionsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import './TypesList.css';

const DivisionsList = () => {
  const toast = useToast();
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDivisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const response = await divisionsAPI.getAll();
      setDivisions(response.data);
    } catch (error) {
      toast.error('Failed to load divisions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await divisionsAPI.create({ name: newName.trim() });
      setNewName('');
      loadDivisions();
      toast.success('Division added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create division');
    }
  };

  const handleEdit = (division) => {
    setEditingId(division.id);
    setEditName(division.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await divisionsAPI.update(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      loadDivisions();
      toast.success('Division updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update division');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await divisionsAPI.delete(deleteId);
      loadDivisions();
      toast.success('Division deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete division');
      setDeleteId(null);
    }
  };

  const filtered = divisions.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-page loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading divisions...</span>
      </div>
    );
  }

  return (
    <div className="manage-page">
      <div className="page-title-bar">
        <div className="page-title-left">
          <h2 className="page-title">Divisions</h2>
          <span className="page-count">{divisions.length}</span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="manage-create-form">
        <div className="manage-create-input-wrap">
          <svg className="manage-create-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new division name..."
            className="manage-create-input"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary manage-create-btn">Add Division</button>
      </form>

      {divisions.length > 4 && (
        <div className="manage-search-bar">
          <svg className="manage-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search divisions..."
            className="manage-search-input"
          />
          {searchQuery && (
            <button type="button" className="manage-search-clear" onClick={() => setSearchQuery('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="manage-empty-state">
          <div className="manage-empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="manage-empty-title">
            {searchQuery ? 'No matching divisions' : 'No divisions yet'}
          </h3>
          <p className="manage-empty-text">
            {searchQuery
              ? `No divisions match "${searchQuery}".`
              : 'Create divisions like education, fitness, or healthcare.'}
          </p>
        </div>
      ) : (
        <div className="manage-items-list">
          {filtered.map(division => (
            <div key={division.id} className={`manage-item ${editingId === division.id ? 'editing' : ''}`}>
              {editingId === division.id ? (
                <div className="manage-item-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="manage-edit-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(division.id);
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <div className="manage-edit-actions">
                    <button className="manage-edit-save" onClick={() => handleUpdate(division.id)} title="Save">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button className="manage-edit-cancel" onClick={handleCancel} title="Cancel">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="manage-item-content">
                    <div className="manage-item-indicator" />
                    <span className="manage-item-name">{division.name}</span>
                  </div>
                  <div className="manage-item-actions">
                    <button className="manage-action-btn manage-action-edit" onClick={() => handleEdit(division)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="manage-action-btn manage-action-delete" onClick={() => setDeleteId(division.id)} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Division"
        message="Are you sure? This will fail if any projects use this division."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DivisionsList;
