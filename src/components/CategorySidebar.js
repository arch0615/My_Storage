import React, { useState } from 'react';
import './CategorySidebar.css';

const CategorySidebar = ({ value, onChange, types = [], divisions = [] }) => {
  const [expandedTypes, setExpandedTypes] = useState(new Set(types.map(t => t.id)));
  const [typeSearch, setTypeSearch] = useState({});

  const toggleType = (id) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const select = (val) => onChange(val);

  return (
    <nav className="cat-sidebar">
      <div className="cat-sidebar-title">Categories</div>

      {/* All */}
      <button
        className={`cat-sidebar-all ${!value ? 'selected' : ''}`}
        onClick={() => select('')}
      >
        All Projects
      </button>

      {/* Types + shared divisions */}
      {types.map(type => {
        const typeVal = `type:${type.id}`;
        const isTypeSelected = value === typeVal;
        const isExpanded = expandedTypes.has(type.id);
        const searchQuery = typeSearch[type.id] || '';
        const filteredDivisions = searchQuery.trim()
          ? divisions.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
          : divisions;

        return (
          <div key={type.id} className="cat-sidebar-group">
            <div className="cat-sidebar-type-row">
              <button
                className="cat-sidebar-expand"
                onClick={() => toggleType(type.id)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                className={`cat-sidebar-type ${isTypeSelected ? 'selected' : ''}`}
                onClick={() => select(typeVal)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-sidebar-folder">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {type.name}
              </button>
            </div>

            {isExpanded && (
              <div className="cat-sidebar-divisions">
                {/* Per-type search box */}
                <div className="cat-sidebar-search-wrap">
                  <svg className="cat-sidebar-search-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    className="cat-sidebar-search"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setTypeSearch(prev => ({ ...prev, [type.id]: e.target.value }))}
                  />
                  {searchQuery && (
                    <button
                      className="cat-sidebar-search-clear"
                      onClick={() => setTypeSearch(prev => ({ ...prev, [type.id]: '' }))}
                      aria-label="Clear search"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {filteredDivisions.map(div => {
                  const divVal = `type:${type.id}/division:${div.id}`;
                  const isDivSelected = value === divVal;
                  return (
                    <button
                      key={div.id}
                      className={`cat-sidebar-division ${isDivSelected ? 'selected' : ''}`}
                      onClick={() => select(divVal)}
                    >
                      <span className="cat-sidebar-dot" />
                      {div.name}
                    </button>
                  );
                })}

                {filteredDivisions.length === 0 && (
                  <span className="cat-sidebar-empty">
                    {searchQuery ? 'No matches' : 'No divisions'}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {types.length === 0 && (
        <span className="cat-sidebar-empty">No categories</span>
      )}
    </nav>
  );
};

export default CategorySidebar;
