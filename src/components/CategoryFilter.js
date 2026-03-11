import React, { useState, useRef, useEffect } from 'react';
import './CategoryFilter.css';

/**
 * A single dropdown that shows types as bold group headers (selectable)
 * and their divisions as indented children (selectable).
 *
 * value: '' | 'type:{id}' | 'division:{id}'
 * onChange(value: string): void
 */
const CategoryFilter = ({ value, onChange, types = [], divisions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getLabel = () => {
    if (!value) return 'All Categories';
    if (value.startsWith('type:')) {
      const id = parseInt(value.replace('type:', ''));
      return types.find(t => t.id === id)?.name || 'All Categories';
    }
    if (value.startsWith('division:')) {
      const id = parseInt(value.replace('division:', ''));
      return divisions.find(d => d.id === id)?.name || 'All Categories';
    }
    return 'All Categories';
  };

  const select = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`cat-filter ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="cat-filter-trigger"
        onClick={() => setIsOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!value ? 'placeholder' : ''}>{getLabel()}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="cat-filter-chevron"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="cat-filter-dropdown" role="listbox">
          {/* All */}
          <div
            className={`cat-filter-option cat-filter-all ${!value ? 'selected' : ''}`}
            onClick={() => select('')}
            role="option"
            tabIndex={0}
            aria-selected={!value}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select('')}
          >
            All Categories
          </div>

          {types.map(type => {
            const children = divisions;
            const typeVal = `type:${type.id}`;
            const isTypeSelected = value === typeVal;

            return (
              <div key={type.id} className="cat-filter-group">
                {/* Type (parent) */}
                <div
                  className={`cat-filter-option cat-filter-type ${isTypeSelected ? 'selected' : ''}`}
                  onClick={() => select(typeVal)}
                  role="option"
                  tabIndex={0}
                  aria-selected={isTypeSelected}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select(typeVal)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-filter-folder">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {type.name}
                </div>

                {/* Divisions (children) */}
                {children.map(div => {
                  const divVal = `division:${div.id}`;
                  const isDivSelected = value === divVal;
                  return (
                    <div
                      key={div.id}
                      className={`cat-filter-option cat-filter-division ${isDivSelected ? 'selected' : ''}`}
                      onClick={() => select(divVal)}
                      role="option"
                      tabIndex={0}
                      aria-selected={isDivSelected}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select(divVal)}
                    >
                      <span className="cat-filter-indent-icon" aria-hidden="true" />
                      {div.name}
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
