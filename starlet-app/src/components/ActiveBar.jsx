import React from 'react';
import { X } from 'lucide-react';
import { GENRE_LABELS, AGE_BRACKET_LABELS } from '../constants';

export default function ActiveBar({
  searchQuery,
  onClearSearch,
  activeFilters,
  onRemoveFilter,
  onClearAll
}) {
  const chips = [];

  if (searchQuery) {
    chips.push({
      type: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: onClearSearch
    });
  }

  for (const [facet, vals] of Object.entries(activeFilters)) {
    if (!vals || !vals.size) continue;
    for (const v of vals) {
      const label = AGE_BRACKET_LABELS[v] || GENRE_LABELS[v] || v;
      chips.push({
        type: 'facet',
        label: `${facet === 'ageBracket' ? 'Age' : facet}: ${label}`,
        onRemove: () => onRemoveFilter(facet, v)
      });
    }
  }

  if (!chips.length) return null;

  return (
    <div className="bg-[#120e13] border-b border-[var(--line)] py-2 px-4 sm:px-6">
      <div className="max-w-[1680px] mx-auto flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[var(--muted)] font-medium">Active filters:</span>
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b151b] border border-[var(--accent-medium)] text-[var(--accent)] font-medium shadow-sm"
          >
            <span>{chip.label}</span>
            <button
              onClick={chip.onRemove}
              className="hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={onClearAll}
          className="text-xs text-[var(--muted)] underline hover:text-[var(--ink)] ml-2"
        >
          Reset all
        </button>
      </div>
    </div>
  );
}
