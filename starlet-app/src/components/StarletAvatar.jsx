import React, { useState } from 'react';

// Generates consistent initials from name
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '★';
}

// Color schemes matching hair/demographics
const HAIR_PALETTES = {
  blonde: 'from-amber-400/30 to-yellow-600/40 text-amber-200 border-amber-400/40',
  brunette: 'from-amber-900/40 to-stone-900/60 text-amber-100 border-amber-800/40',
  redhead: 'from-rose-600/30 to-amber-700/40 text-rose-200 border-rose-500/40',
  black: 'from-zinc-800 to-black text-zinc-200 border-zinc-700/50',
  default: 'from-[var(--accent)]/20 to-purple-900/30 text-amber-200 border-[var(--accent)]/40'
};

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
  '3xl': 'w-36 h-36 text-4xl',
  '4xl': 'w-48 h-48 sm:w-64 sm:h-64 text-5xl',
  full: 'w-full h-full text-4xl'
};

export default function StarletAvatar({
  id,
  name,
  hair = 'default',
  size = 'md',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);
  const [triedBabepedia, setTriedBabepedia] = useState(false);

  const sizeClass = SIZES[size] || SIZES.md;
  const hairKey = (hair || '').toLowerCase();
  const palette = HAIR_PALETTES[hairKey] || HAIR_PALETTES.default;
  const initials = getInitials(name);

  // If local JPG failed or missing, render luxury radial initials badge
  if (hasError || !id) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br ${palette} border flex items-center justify-center font-serif font-bold shadow-inner select-none flex-shrink-0 ${className}`}
        title={name}
      >
        <span>{initials}</span>
      </div>
    );
  }

  const src = triedBabepedia
    ? `https://www.babepedia.com/pics/${encodeURIComponent((name || '').replace(/\s+/g, '_'))}.jpg`
    : `./avatars/${id}.jpg`;

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden border border-[var(--accent)]/50 bg-[#161019] flex-shrink-0 shadow-md ${className}`}>
      <img
        src={src}
        alt={name || ''}
        loading="lazy"
        onError={() => {
          if (!triedBabepedia) {
            setTriedBabepedia(true);
          } else {
            setHasError(true);
          }
        }}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}

