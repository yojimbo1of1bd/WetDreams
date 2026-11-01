import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Filter, PanelLeftClose, X } from 'lucide-react';
import { GENRE_LABELS, AGE_BRACKET_LABELS } from '../constants';

const FACETS = [
  { id: 'ageBracket', label: 'Age Group / Bracket' },
  { id: 'genre', label: 'Family Scenario Genre' },
  { id: 'tier', label: 'Award / Stardom Tier' },
  { id: 'hair', label: 'Hair Color' },
  { id: 'body', label: 'Body Type' },
  { id: 'ethnicity', label: 'Ethnicity' },
  { id: 'nationality', label: 'Nationality' }
];

export default function Sidebar({
  facetCounts,
  activeFilters,
  onToggleFilter,
  onClose
}) {
  const [collapsed, setCollapsed] = useState({
    ageBracket: false,
    genre: false,
    tier: false,
    ethnicity: true,
    nationality: true
  });

  const toggleSection = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
      <div className="glass rounded-2xl p-4 border border-[var(--line)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Smart Filters
            </h2>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted)] hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Collapse filter sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
              <span>Hide</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {FACETS.map(facet => {
            const counts = facetCounts[facet.id] || [];
            if (!counts.length) return null;
            const isCollapsed = collapsed[facet.id];
            const selectedVals = activeFilters[facet.id] || new Set();

            return (
              <div key={facet.id} className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0">
                <button
                  onClick={() => toggleSection(facet.id)}
                  className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <span className="uppercase tracking-wider text-[11px] font-bold text-[#e0d6cd]">
                    {facet.label}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                    {counts.map(({ val, count }) => {
                      const isChecked = selectedVals.has(val);
                      const displayLabel = AGE_BRACKET_LABELS[val] || GENRE_LABELS[val] || val.replace(/-/g, ' ');
                      return (
                        <label
                          key={val}
                          className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-[#1f1820]/70 cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleFilter(facet.id, val)}
                              className="w-3.5 h-3.5 accent-[var(--accent)] rounded border-[var(--line)] cursor-pointer"
                            />
                            <span className={`truncate capitalize ${isChecked ? 'text-[var(--accent)] font-semibold' : ''}`}>
                              {displayLabel}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)]/60 font-mono">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
