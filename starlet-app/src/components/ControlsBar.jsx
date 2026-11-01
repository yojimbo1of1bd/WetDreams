import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpDown, LayoutGrid, List, Sparkles, Tag, SlidersHorizontal } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';

const POPULAR_TOKENS = [
  { label: 'Mom Swap', token: '"mom swap"' },
  { label: 'Stepdaughter Birthday', token: '"step daughter birthday"' },
  { label: 'Blackmail', token: 'blackmail' },
  { label: 'Permission', token: 'permission' },
  { label: 'Shared Bed', token: '"shared bed"' },
  { label: 'Under 25', token: 'under 25' },
  { label: 'Newcomers', token: 'newcomers' }
];

export default function ControlsBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  searchInputRef,
  performers,
  onSelectPerformer,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Detect active structured tokens in search
  const detectedTokens = useMemo(() => {
    if (!searchQuery) return [];
    const tokens = [];
    const q = searchQuery.toLowerCase();

    if (/mom\s*swap/i.test(q)) tokens.push({ label: 'Scenario: Mom Swap', type: 'scenario' });
    if (/step\s*daughter\s*birthday|birthday/i.test(q)) tokens.push({ label: 'Scenario: Birthday', type: 'scenario' });
    if (/step\s*daughter/i.test(q) && !tokens.some(t => t.label.includes('Birthday'))) tokens.push({ label: 'Role: Stepdaughter', type: 'role' });
    if (/blackmail/i.test(q)) tokens.push({ label: 'Scenario: Blackmail', type: 'scenario' });
    if (/permission/i.test(q)) tokens.push({ label: 'Scenario: Permission', type: 'scenario' });
    if (/shared\s*bed/i.test(q)) tokens.push({ label: 'Scenario: Shared Bed', type: 'scenario' });
    if (/under\s*\d{2}/i.test(q)) tokens.push({ label: q.match(/under\s*\d{2}/i)[0], type: 'filter' });
    if (/newcomers?/i.test(q)) tokens.push({ label: 'Filter: Newcomers', type: 'filter' });

    return tokens;
  }, [searchQuery]);

  const handleChipClick = (token) => {
    if (searchQuery.toLowerCase().includes(token.toLowerCase().replace(/"/g, ''))) {
      return; // Already present
    }
    const next = searchQuery ? `${searchQuery.trim()} ${token}` : token;
    onSearchChange(next);
  };

  return (
    <div className="glass border-b border-[var(--line)] py-4 px-4 sm:px-6 relative z-30 bg-[#120d14]/90 backdrop-blur-xl">
      <div className="max-w-[1680px] mx-auto flex flex-col gap-3">
        {/* Main Controls Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Prominent Command-Palette Search Input */}
          <div className="relative w-full max-w-2xl lg:max-w-3xl flex items-center">
            <Search className="w-5 h-5 text-[var(--accent)] absolute left-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 220)}
              placeholder="Search starlet, studio, 'mom swap', 'step daughter birthday', 'under 25'... [/]"
              className="w-full bg-[#161018] border-2 border-[var(--line)] focus:border-[var(--accent)] text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted)]/50 rounded-2xl pl-12 pr-20 py-3.5 outline-none transition-all shadow-inner hover:border-[var(--line-strong)]"
            />

            <div className="absolute right-3.5 flex items-center gap-2">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--ink)] bg-white/5 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-zinc-400 border border-white/10">
                  /
                </kbd>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            <SearchAutocomplete
              isOpen={isFocused}
              query={searchQuery}
              performers={performers}
              onSelectPerformer={(p) => {
                onSelectPerformer(p);
                setIsFocused(false);
              }}
            />
          </div>

          {/* Sort & Quick Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
            {/* Filter Toggle Button (Rule of Odds: Collapsible Drawer) */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all shadow-sm ${
                showFilters
                  ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-bold'
                  : 'bg-[#161018] text-[var(--muted)] border-[var(--line)] hover:text-white hover:border-[var(--line-strong)]'
              }`}
              title={showFilters ? 'Collapse filter sidebar' : 'Expand filter sidebar'}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {activeFilterCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  showFilters ? 'bg-black text-[var(--accent)]' : 'bg-[var(--accent)] text-black'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 bg-[#161018] border border-[var(--line)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--muted)] shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-[var(--accent)]" />
              <select
                value={sortOption}
                onChange={e => onSortChange(e.target.value)}
                className="bg-transparent text-[var(--ink)] text-xs outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="rating" className="bg-[#141014]">★ Highest Rated (Default)</option>
                <option value="name" className="bg-[#141014]">Name (A-Z)</option>
                <option value="smart" className="bg-[#141014]">Discovery & Novelty</option>
                <option value="scenes" className="bg-[#141014]">Most Scenes</option>
                <option value="newest" className="bg-[#141014]">Newest Debut</option>
                <option value="oldest" className="bg-[#141014]">Oldest Debut</option>
                <option value="age" className="bg-[#141014]">Age (Youngest)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#161018] border border-[var(--line)] rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'grid' ? 'bg-[var(--accent)] text-[#09070a]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--accent)] text-[#09070a]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Compact View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs px-3.5 py-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quick Scenario & Filter Suggestions Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-semibold text-[var(--muted)] flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-[var(--accent)]" /> Quick Tokens:
          </span>
          {POPULAR_TOKENS.map(item => (
            <button
              key={item.label}
              onClick={() => handleChipClick(item.token)}
              className="px-2.5 py-1 rounded-full bg-[#1b141d] hover:bg-[var(--accent)]/15 border border-[var(--line)] hover:border-[var(--accent)] text-[11px] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer font-medium"
            >
              {item.label}
            </button>
          ))}

          {/* Active Parsed Tokens Feedback */}
          {detectedTokens.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Parsed:</span>
              {detectedTokens.map(tok => (
                <span
                  key={tok.label}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                >
                  {tok.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
