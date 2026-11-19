// Progress storage for Leonida Legend: earned trophy ids and view settings live in localStorage,
// and progress can be exported to a JSON file and imported back (the tracker never phones home).

export const PROGRESS_KEY = 'leonida-legend-progress-v1';
export const SETTINGS_KEY = 'leonida-legend-settings-v1';

export function loadEarnedIds() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarnedIds(earnedIds) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
}

export function loadSettings() {
  const fallback = { spoilerShield: false, onlyUnearned: false, kind: 'all', grade: 'all', query: '', view: 'checklist' };
  try {
    return { ...fallback, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')) };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// The exported file: a small JSON document a player can keep, share or re-import later.
export function buildExportText(earnedIds, trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  return JSON.stringify(
    {
      app: 'Leonida Legend — GTA VI trophy tracker',
      game: 'Grand Theft Auto VI',
      platform: 'PlayStation 5',
      exportedAt: new Date().toISOString(),
      earnedCount: earnedIds.size,
      earned: [...earnedIds].sort((a, b) => a - b).map((id) => ({ id, name: byId.get(id)?.name ?? '' })),
    },
    null,
    2,
  );
}

export function downloadExport(earnedIds, trophies) {
  const blob = new Blob([buildExportText(earnedIds, trophies)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

// Accepts our export format ({earned: [{id}...]} or {earned: [ids]}), a bare array of ids,
// or a bare array of trophy names, so older or hand-made files still import.
export function parseImportedProgress(text, trophies) {
  const data = JSON.parse(text);
  const byName = new Map(trophies.map((t) => [t.name.toLowerCase(), t.id]));
  const validIds = new Set(trophies.map((t) => t.id));
  const found = new Set();
  const collect = (value) => {
    if (Number.isInteger(value) && validIds.has(value)) found.add(value);
    else if (typeof value === 'string' && byName.has(value.toLowerCase())) found.add(byName.get(value.toLowerCase()));
    else if (value && typeof value === 'object' && Number.isInteger(value.id) && validIds.has(value.id)) found.add(value.id);
  };
  if (Array.isArray(data)) data.forEach(collect);
  else if (data && Array.isArray(data.earned)) data.earned.forEach(collect);
  else if (data && Array.isArray(data.ids)) data.ids.forEach(collect);
  return found;
}
