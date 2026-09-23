/**
 * Utility for neutral, faceless avatars (identicon, abstract geometric shapes, rings).
 * Guarantees zero real human faces across default avatars, presets, and fallbacks.
 */

export type AvatarStyle = 'shapes' | 'identicon' | 'rings' | 'bottts-neutral';

export const getNeutralAvatarUrl = (
  seed: string = 'user',
  style: AvatarStyle = 'shapes'
): string => {
  const safeSeed = encodeURIComponent(seed.trim().toLowerCase() || 'student');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}`;
};

export const isHumanPhotoUrl = (url?: string): boolean => {
  if (!url) return false;
  const humanPhotoPatterns = [
    'images.unsplash.com',
    'unsplash.com',
    'pexels.com',
    'randomuser.me',
    'thispersondoesnotexist.com',
    'photo-1573496359142',
    'photo-1535713875002',
    'photo-1507003211169',
    'photo-1517841905240',
    'photo-1568602471122'
  ];
  return humanPhotoPatterns.some((pattern) => url.toLowerCase().includes(pattern));
};

export const sanitizeAvatarUrl = (
  url?: string,
  seed: string = 'user',
  defaultStyle: AvatarStyle = 'shapes'
): string => {
  if (!url || isHumanPhotoUrl(url)) {
    return getNeutralAvatarUrl(seed, defaultStyle);
  }
  return url;
};

export const NEUTRAL_AVATAR_PRESETS = [
  { id: 'shapes-1', label: 'Геометрия 1', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=nexus1' },
  { id: 'shapes-2', label: 'Геометрия 2', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=apex42' },
  { id: 'identicon-1', label: 'Идентикон 1', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=cipher9' },
  { id: 'identicon-2', label: 'Идентикон 2', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=matrix7' },
  { id: 'rings-1', label: 'Орбита', url: 'https://api.dicebear.com/7.x/rings/svg?seed=orbit23' },
  { id: 'rings-2', label: 'Сфера', url: 'https://api.dicebear.com/7.x/rings/svg?seed=quantum88' },
  { id: 'bottts-1', label: 'Кибер 1', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=bot99' },
  { id: 'bottts-2', label: 'Кибер 2', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=droid12' },
];

export const FALLBACK_AVATAR_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="12" fill="%2318181b"/><circle cx="32" cy="25" r="10" stroke="%2310b981" stroke-width="2" fill="none"/><path d="M16 50C16 42.268 23.163 36 32 36C40.837 36 48 42.268 48 50" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/></svg>';
