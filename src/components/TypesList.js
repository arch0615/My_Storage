import React, { useState, useEffect } from 'react';
import { typesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import './TypesList.css';

const TypesList = () => {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const response = await typesAPI.getAll();
      setTypes(response.data);
    } catch (error) {
      toast.error('Failed to load types. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await typesAPI.create({ name: newName.trim() });
      setNewName('');
      loadTypes();
      toast.success('Type added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create type');
    }
  };

  const handleEdit = (type) => {
    setEditingId(type.id);
    setEditName(type.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await typesAPI.update(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      loadTypes();
      toast.success('Type updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update type');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await typesAPI.delete(deleteId);
      loadTypes();
      toast.success('Type deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete type');
      setDeleteId(null);
    }
  };

  const filtered = types.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-page loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading types...</span>
      </div>
    );
  }

  return (
    <div className="manage-page">
      <div className="page-title-bar">
        <div className="page-title-left">
          <h2 className="page-title">Types</h2>
          <span className="page-count">{types.length}</span>
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
            placeholder="Enter new type name..."
            className="manage-create-input"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary manage-create-btn">Add Type</button>
      </form>

      {types.length > 4 && (
        <div className="manage-search-bar">
          <svg className="manage-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search types..."
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
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <h3 className="manage-empty-title">
            {searchQuery ? 'No matching types' : 'No types yet'}
          </h3>
          <p className="manage-empty-text">
            {searchQuery
              ? `No types match "${searchQuery}".`
              : 'Create project types like mobile, web, or automation.'}
          </p>
        </div>
      ) : (
        <div className="manage-items-list">
          {filtered.map(type => (
            <div key={type.id} className={`manage-item ${editingId === type.id ? 'editing' : ''}`}>
              {editingId === type.id ? (
                <div className="manage-item-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="manage-edit-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(type.id);
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <div className="manage-edit-actions">
                    <button className="manage-edit-save" onClick={() => handleUpdate(type.id)} title="Save">
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
                    <span className="manage-item-name">{type.name}</span>
                  </div>
                  <div className="manage-item-actions">
                    <button className="manage-action-btn manage-action-edit" onClick={() => handleEdit(type)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="manage-action-btn manage-action-delete" onClick={() => setDeleteId(type.id)} title="Delete">
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
        title="Delete Type"
        message="Are you sure? This will fail if any projects use this type."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default TypesList;
