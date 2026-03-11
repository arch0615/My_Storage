import React, { useState, useEffect } from 'react';
import { typesAPI, divisionsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import './CategoryPage.css';

const ChevronIcon = ({ expanded }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CategoryPage = () => {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  const [editingType, setEditingType] = useState(null);
  const [editingDivision, setEditingDivision] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [addingDivision, setAddingDivision] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesRes, divisionsRes] = await Promise.all([
        typesAPI.getAll(),
        divisionsAPI.getAll(),
      ]);
      setTypes(typesRes.data);
      setDivisions(divisionsRes.data);
      setExpandedTypes(new Set(typesRes.data.map(t => t.id)));
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Types CRUD ── */
  const handleCreateType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      const res = await typesAPI.create({ name: newTypeName.trim() });
      setNewTypeName('');
      setTypes(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setExpandedTypes(prev => new Set([...prev, res.data.id]));
      toast.success('Type added');
    } catch {
      toast.error('Failed to create type');
    }
  };

  const handleUpdateType = async (id) => {
    if (!editingType?.name.trim()) return;
    try {
      const res = await typesAPI.update(id, { name: editingType.name.trim() });
      setTypes(prev => prev.map(t => t.id === id ? res.data : t).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingType(null);
      toast.success('Type updated');
    } catch {
      toast.error('Failed to update type');
    }
  };

  /* ── Divisions CRUD ── */
  const handleCreateDivision = async (e) => {
    e.preventDefault();
    if (!newDivisionName.trim()) return;
    try {
      const res = await divisionsAPI.create({ name: newDivisionName.trim() });
      setDivisions(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDivisionName('');
      setAddingDivision(false);
      toast.success('Division added');
    } catch {
      toast.error('Failed to create division');
    }
  };

  const handleUpdateDivision = async (id) => {
    if (!editingDivision?.name.trim()) return;
    try {
      const res = await divisionsAPI.update(id, { name: editingDivision.name.trim() });
      setDivisions(prev => prev.map(d => d.id === id ? res.data : d).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingDivision(null);
      toast.success('Division updated');
    } catch {
      toast.error('Failed to update division');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.kind === 'type') {
        await typesAPI.delete(deleteConfirm.id);
        setTypes(prev => prev.filter(t => t.id !== deleteConfirm.id));
        toast.success('Type deleted');
      } else {
        await divisionsAPI.delete(deleteConfirm.id);
        setDivisions(prev => prev.filter(d => d.id !== deleteConfirm.id));
        toast.success('Division deleted');
      }
    } catch {
      toast.error(`Failed to delete ${deleteConfirm.kind}`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Page header */}
      <div className="page-title-bar">
        <div className="page-title-left">
          <h2 className="page-title">Categories</h2>
          <span className="page-count">
            {types.length} {types.length === 1 ? 'type' : 'types'} · {divisions.length} divisions
          </span>
        </div>
      </div>

      {/* Add Type */}
      <form onSubmit={handleCreateType} className="cat-add-form">
        <input
          type="text"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          placeholder="New type name..."
          className="cat-add-input"
        />
        <button type="submit" className="btn btn-primary cat-add-btn" disabled={!newTypeName.trim()}>
          <PlusIcon />
          Add Type
        </button>
      </form>

      {/* Tree */}
      {types.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No categories yet</h3>
          <p className="empty-state-text">Add a type above to start building your category tree.</p>
        </div>
      ) : (
        <div className="cat-tree">
          {types.map((type) => {
            const isExpanded = expandedTypes.has(type.id);
            const isEditingThis = editingType?.id === type.id;
            const showChildren = isExpanded && (divisions.length > 0 || addingDivision);

            return (
              <div key={type.id} className="cat-type-node">
                {/* Type row */}
                <div className={`cat-type-row ${isEditingThis ? 'is-editing' : ''}`}>
                  <button
                    className="cat-expand-btn"
                    onClick={() => toggleExpand(type.id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronIcon expanded={isExpanded} />
                  </button>

                  {isEditingThis ? (
                    <input
                      className="cat-inline-input cat-type-inline-input"
                      value={editingType.name}
                      autoFocus
                      onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateType(type.id);
                        if (e.key === 'Escape') setEditingType(null);
                      }}
                    />
                  ) : (
                    <div className="cat-type-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-folder-icon">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="cat-type-name">{type.name}</span>
                      <span className="cat-badge">{divisions.length}</span>
                    </div>
                  )}

                  <div className="cat-actions">
                    {isEditingThis ? (
                      <>
                        <button className="cat-btn cat-btn-save" onClick={() => handleUpdateType(type.id)} title="Save"><CheckIcon /></button>
                        <button className="cat-btn cat-btn-cancel" onClick={() => setEditingType(null)} title="Cancel"><XIcon /></button>
                      </>
                    ) : (
                      <>
                        <button className="cat-btn" title="Edit type" onClick={() => setEditingType({ id: type.id, name: type.name })}><EditIcon /></button>
                        <button className="cat-btn cat-btn-delete" title="Delete type" onClick={() => setDeleteConfirm({ id: type.id, kind: 'type' })}><DeleteIcon /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Division children — all divisions shared across every type */}
                {showChildren && (
                  <div className="cat-children">
                    {divisions.map((div, idx) => {
                      const isLast = idx === divisions.length - 1 && !addingDivision;
                      const isEditingDiv = editingDivision?.id === div.id;
                      return (
                        <div key={div.id} className={`cat-div-row ${isLast ? 'is-last' : ''} ${isEditingDiv ? 'is-editing' : ''}`}>
                          <div className="cat-tree-lines" aria-hidden="true">
                            <span className={`cat-vline ${isLast ? 'half' : ''}`} />
                            <span className="cat-hline" />
                          </div>

                          {isEditingDiv ? (
                            <input
                              className="cat-inline-input"
                              value={editingDivision.name}
                              autoFocus
                              onChange={(e) => setEditingDivision({ ...editingDivision, name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateDivision(div.id);
                                if (e.key === 'Escape') setEditingDivision(null);
                              }}
                            />
                          ) : (
                            <span className="cat-div-name">{div.name}</span>
                          )}

                          <div className="cat-actions">
                            {isEditingDiv ? (
                              <>
                                <button className="cat-btn cat-btn-save" onClick={() => handleUpdateDivision(div.id)} title="Save"><CheckIcon /></button>
                                <button className="cat-btn cat-btn-cancel" onClick={() => setEditingDivision(null)} title="Cancel"><XIcon /></button>
                              </>
                            ) : (
                              <>
                                <button className="cat-btn" title="Edit" onClick={() => setEditingDivision({ id: div.id, name: div.name })}><EditIcon /></button>
                                <button className="cat-btn cat-btn-delete" title="Delete" onClick={() => setDeleteConfirm({ id: div.id, kind: 'division' })}><DeleteIcon /></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Inline add division — only shown on the first expanded type to avoid duplication */}
                    {addingDivision && expandedTypes.values().next().value === type.id && (
                      <div className="cat-div-row is-last">
                        <div className="cat-tree-lines" aria-hidden="true">
                          <span className="cat-vline half" />
                          <span className="cat-hline" />
                        </div>
                        <form className="cat-add-div-form" onSubmit={handleCreateDivision}>
                          <input
                            className="cat-inline-input"
                            value={newDivisionName}
                            onChange={(e) => setNewDivisionName(e.target.value)}
                            placeholder="Division name..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                setAddingDivision(false);
                                setNewDivisionName('');
                              }
                            }}
                          />
                          <button type="submit" className="cat-btn cat-btn-save" title="Add"><CheckIcon /></button>
                          <button type="button" className="cat-btn cat-btn-cancel" onClick={() => { setAddingDivision(false); setNewDivisionName(''); }} title="Cancel"><XIcon /></button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded but no divisions and not adding */}
                {isExpanded && divisions.length === 0 && !addingDivision && (
                  <div className="cat-empty-children">
                    No divisions yet — click <strong>Add Division</strong> below to add one.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Division — global, shown below tree */}
      {types.length > 0 && (
        <div className="cat-add-division-bar">
          {addingDivision ? (
            <form onSubmit={handleCreateDivision} className="cat-add-form cat-add-division-form">
              <input
                type="text"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                placeholder="New division name..."
                className="cat-add-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setAddingDivision(false);
                    setNewDivisionName('');
                  }
                }}
              />
              <button type="submit" className="btn btn-primary cat-add-btn" disabled={!newDivisionName.trim()}>
                <CheckIcon />
                Add
              </button>
              <button type="button" className="btn cat-add-btn cat-add-btn-cancel" onClick={() => { setAddingDivision(false); setNewDivisionName(''); }}>
                Cancel
              </button>
            </form>
          ) : (
            <button
              className="btn cat-add-division-btn"
              onClick={() => {
                setAddingDivision(true);
                setExpandedTypes(new Set(types.map(t => t.id)));
              }}
            >
              <PlusIcon />
              Add Division
            </button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.kind === 'type' ? 'Delete Type' : 'Delete Division'}
        message={`Are you sure? This may fail if projects are using this ${deleteConfirm?.kind}.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default CategoryPage;
