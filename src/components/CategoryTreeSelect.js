import React, { useState, useRef, useEffect } from 'react';
import './CategoryTreeSelect.css';

/**
 * A dropdown tree picker that lets the user select a type + division together.
 * onChange({ typeId, divisionId }) is called when a division is picked.
 */
const CategoryTreeSelect = ({ typeId, divisionId, types = [], divisions = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState(new Set(types.map(t => t.id)));
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
      setExpandedTypes(new Set(types.map(t => t.id)));
    } else {
      setSearch('');
    }
  }, [isOpen, types]);

  const toggleType = (id) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectDivision = (tId, dId) => {
    onChange({ typeId: tId, divisionId: dId });
    setIsOpen(false);
  };

  const getLabel = () => {
    if (!typeId && !divisionId) return null;
    const typeName = types.find(t => t.id === typeId)?.name;
    const divisionName = divisions.find(d => d.id === divisionId)?.name;
    if (typeName && divisionName) return `${typeName} › ${divisionName}`;
    if (divisionName) return divisionName;
    if (typeName) return typeName;
    return null;
  };

  const label = getLabel();

  const filteredDivisions = search.trim()
    ? divisions.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    : divisions;

  // When searching, expand all types automatically
  const effectiveExpanded = search.trim()
    ? new Set(types.map(t => t.id))
    : expandedTypes;

  return (
    <div ref={containerRef} className={`cts-wrap ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className={`cts-trigger ${!label ? 'cts-placeholder' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-haspopup="tree"
        aria-expanded={isOpen}
      >
        {label ? (
          <span className="cts-label">
            <span className="cts-label-type">{types.find(t => t.id === typeId)?.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cts-chevron-sep">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="cts-label-div">{divisions.find(d => d.id === divisionId)?.name}</span>
          </span>
        ) : (
          <span>Select category...</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cts-arrow">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="cts-dropdown">
          {/* Search */}
          <div className="cts-search-wrap">
            <svg className="cts-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              className="cts-search"
              type="text"
              placeholder="Search divisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="cts-search-clear" type="button" onClick={() => setSearch('')}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Tree */}
          <div className="cts-tree">
            {types.map(type => {
              const isExpanded = effectiveExpanded.has(type.id);

              return (
                <div key={type.id} className="cts-type-group">
                  <div className="cts-type-row">
                    {!search.trim() && (
                      <button
                        type="button"
                        className="cts-expand-btn"
                        onClick={() => toggleType(type.id)}
                      >
                        <svg
                          width="9" height="9" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    )}
                    <div className="cts-type-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cts-folder-icon">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {type.name}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="cts-divisions">
                      {filteredDivisions.map(div => {
                        const isSelected = typeId === type.id && divisionId === div.id;
                        return (
                          <button
                            key={div.id}
                            type="button"
                            className={`cts-division ${isSelected ? 'selected' : ''}`}
                            onClick={() => selectDivision(type.id, div.id)}
                          >
                            <span className="cts-dot" />
                            {div.name}
                          </button>
                        );
                      })}
                      {filteredDivisions.length === 0 && (
                        <span className="cts-empty">No matches</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTreeSelect;
