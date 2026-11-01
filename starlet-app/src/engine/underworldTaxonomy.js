/**
 * underworldTaxonomy.js
 * 
 * ES Module source of truth for the Ciphered Underworld Domains, Subdomains,
 * and Tier 1 / Tier 2 + Reddit Crush Performers.
 */

import taxonomyData from '../../../underworld-taxonomy.json';
import underworldCacheData from '../../../underworld-scenes-cache.json';

export const UNDERWORLD_TAXONOMY = taxonomyData;
export const CIPHER_COMMANDS = taxonomyData.system.ciphers.pc_commands;
export const GESTURE_SYMBOLS = taxonomyData.system.ciphers.gesture_symbols;
export const UNDERWORLD_DOMAINS = taxonomyData.domains;
export const UNDERWORLD_SCENES_CACHE = underworldCacheData;

export const SUBDOMAIN_EXPLICIT_MAPPING = {
  swap: { domain: 'domain_family_archetypes', subdomain: 'family_swaps', label: '🔄 Family Swaps' },
  swaps: { domain: 'domain_family_archetypes', subdomain: 'family_swaps', label: '🔄 Family Swaps' },
  family_swaps: { domain: 'domain_family_archetypes', subdomain: 'family_swaps', label: '🔄 Family Swaps' },
  cuck: { domain: 'domain_family_archetypes', subdomain: 'cuckold_voyeur', label: '👁️ Cuckold & Voyeur' },
  cuckold: { domain: 'domain_family_archetypes', subdomain: 'cuckold_voyeur', label: '👁️ Cuckold & Voyeur' },
  hotwife: { domain: 'domain_family_archetypes', subdomain: 'cuckold_voyeur', label: '👁️ Cuckold & Voyeur' },
  cuckold_voyeur: { domain: 'domain_family_archetypes', subdomain: 'cuckold_voyeur', label: '👁️ Cuckold & Voyeur' },
  orgy: { domain: 'domain_hardcore_dynamics', subdomain: 'wild_orgies', label: '🎉 Wild Orgies' },
  orgies: { domain: 'domain_hardcore_dynamics', subdomain: 'wild_orgies', label: '🎉 Wild Orgies' },
  wild_orgies: { domain: 'domain_hardcore_dynamics', subdomain: 'wild_orgies', label: '🎉 Wild Orgies' },
  gangbang: { domain: 'domain_hardcore_dynamics', subdomain: 'gangbang_trains', label: '⚡ Gangbangs & Trains' },
  train: { domain: 'domain_hardcore_dynamics', subdomain: 'gangbang_trains', label: '⚡ Gangbangs & Trains' },
  gangbang_trains: { domain: 'domain_hardcore_dynamics', subdomain: 'gangbang_trains', label: '⚡ Gangbangs & Trains' },
  anal: { domain: 'domain_hardcore_dynamics', subdomain: 'anal_choreography', label: '🍑 Anal Artistry' },
  anal_choreography: { domain: 'domain_hardcore_dynamics', subdomain: 'anal_choreography', label: '🍑 Anal Artistry' },
  facial: { domain: 'domain_hardcore_dynamics', subdomain: 'facial_cumshot', label: '💦 Facial Finishes' },
  facials: { domain: 'domain_hardcore_dynamics', subdomain: 'facial_cumshot', label: '💦 Facial Finishes' },
  facial_cumshot: { domain: 'domain_hardcore_dynamics', subdomain: 'facial_cumshot', label: '💦 Facial Finishes' },
  study: { domain: 'domain_games_bets', subdomain: 'study_grades', label: '🎓 Study Sessions' },
  tutor: { domain: 'domain_games_bets', subdomain: 'study_grades', label: '🎓 Study Sessions' },
  study_grades: { domain: 'domain_games_bets', subdomain: 'study_grades', label: '🎓 Study Sessions' },
  chores: { domain: 'domain_games_bets', subdomain: 'chores_points', label: '🧹 Chore Points & Exchange' },
  points: { domain: 'domain_games_bets', subdomain: 'chores_points', label: '🧹 Chore Points & Exchange' },
  point: { domain: 'domain_games_bets', subdomain: 'chores_points', label: '🧹 Chore Points & Exchange' },
  chores_points: { domain: 'domain_games_bets', subdomain: 'chores_points', label: '🧹 Chore Points & Exchange' },
  permission: { domain: 'domain_permission_escalation', subdomain: 'dad_permission', label: '🛡️ Parental Permission' },
  daughter: { domain: 'domain_family_archetypes', subdomain: 'naive_daughter', label: '🤝 The Stepdaughter' },
  escalation: { domain: 'domain_permission_escalation', subdomain: 'gradual_escalation', label: '📈 Persuasion & Escalation' },
  persuasion: { domain: 'domain_permission_escalation', subdomain: 'gradual_escalation', label: '📈 Persuasion & Escalation' },
  abyss: { domain: 'domain_abyssal_nasty', subdomain: 'taboo_extremes', label: '💀 The Abyssal Vault' },
  nasty: { domain: 'domain_abyssal_nasty', subdomain: 'taboo_extremes', label: '💀 The Abyssal Vault' },
  deep: { domain: 'domain_abyssal_nasty', subdomain: 'rough_domination', label: '💀 The Abyssal Vault' },
  depraved: { domain: 'domain_abyssal_nasty', subdomain: 'degradation_limits', label: '💀 The Abyssal Vault' },
  domain_abyssal_nasty: { domain: 'domain_abyssal_nasty', subdomain: 'taboo_extremes', label: '💀 The Abyssal Vault' }
};

export function resolveCipher(commandOrAlias) {
  if (!commandOrAlias || typeof commandOrAlias !== 'string') return null;
  const clean = commandOrAlias.trim().toLowerCase();
  
  // Check explicit subdomain mapping first
  if (SUBDOMAIN_EXPLICIT_MAPPING[clean]) {
    return SUBDOMAIN_EXPLICIT_MAPPING[clean];
  }

  // Fallback to PC commands
  const targetDomainKey = CIPHER_COMMANDS[clean];
  if (!targetDomainKey) return null;
  return targetDomainKey;
}

export function resolveGestureSymbol(symbolKey) {
  return GESTURE_SYMBOLS[symbolKey] || null;
}

