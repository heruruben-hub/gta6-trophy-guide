// Leonida Legend — boot and wiring: loads the official trophy data, restores saved progress,
// connects the toolbar (search, kind chips, grade filter, spoiler shield, export / import),
// the checklist <-> roadmap tabs, and the detail panel. Hash deep links (#view=roadmap,
// #trophy=17, #kind=missable, #spoiler=1, #demo) open the guide on a chosen view, which is
// also how the entry's screenshots were framed.

import { loadEarnedIds, saveEarnedIds, loadSettings, saveSettings, downloadExport, parseImportedProgress } from './storage.js';
import { isMasked, renderTrophyList, renderDetailPanel, renderProgress } from './tracker.js';
import { renderGoldenRules, renderRoadmapStages, renderWatchSection } from './roadmap.js';

// A fixed sample run used by the #demo deep link (and the screenshots): the story through
// Chapter 3 plus a spread of strands, feats and one-offs — 23 of 55 earned.
const DEMO_EARNED_IDS = [2, 3, 4, 5, 8, 9, 10, 16, 18, 19, 20, 21, 22, 25, 29, 33, 34, 36, 39, 41, 44, 46, 51];

const els = {
  list: document.getElementById('trophy-list'),
  listNote: document.getElementById('list-note'),
  detail: document.getElementById('detail-panel'),
  search: document.getElementById('search'),
  kindFilters: document.getElementById('kind-filters'),
  gradeFilter: document.getElementById('grade-filter'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  remainingToggle: document.getElementById('remaining-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importInput: document.getElementById('import-input'),
  tabChecklist: document.getElementById('tab-checklist'),
  tabRoadmap: document.getElementById('tab-roadmap'),
  viewChecklist: document.getElementById('view-checklist'),
  viewRoadmap: document.getElementById('view-roadmap'),
  goldenRules: document.getElementById('golden-rules'),
  roadmapStages: document.getElementById('roadmap-stages'),
  watchSection: document.getElementById('watch-section'),
  progress: {
    count: document.getElementById('progress-count'),
    pct: document.getElementById('progress-pct'),
    fill: document.getElementById('progress-fill'),
    grades: document.getElementById('grade-counts'),
  },
};

const state = {
  trophies: [],
  earnedIds: loadEarnedIds(),
  settings: loadSettings(),
  selectedId: null,
  view: 'checklist',
};

function trophyById(id) {
  return state.trophies.find((t) => t.id === id) ?? null;
}

function persist() {
  saveEarnedIds(state.earnedIds);
  saveSettings({ ...state.settings, view: state.view });
}

function render() {
  renderProgress(state.trophies, state.earnedIds, els.progress);
  const shown = renderTrophyList(els.list, state.trophies, state, callbacks);
  if (state.settings.kind === 'online') {
    els.listNote.textContent = 'The official GTA VI trophy list has no online trophies at launch — all 55 are single-player (Push Square, reporting the Exophase list; GTA Vibes). The Online filter stays here so the check itself is visible.';
  } else {
    els.listNote.textContent = `Showing ${shown} of ${state.trophies.length} trophies. Names, descriptions and grades are the official PlayStation list; every guide is sourced — open a trophy to see its sources.`;
  }
  renderDetailPanel(els.detail, trophyById(state.selectedId), state, callbacks);
  renderGoldenRules(els.goldenRules);
  renderRoadmapStages(els.roadmapStages, state.trophies, state.earnedIds, (t) => isMasked(t, state.earnedIds, state.settings), callbacks.onSelect);
  renderWatchSection(els.watchSection, state.trophies, callbacks.onSelect);
  els.viewChecklist.hidden = state.view !== 'checklist';
  els.viewRoadmap.hidden = state.view !== 'roadmap';
  els.tabChecklist.classList.toggle('active', state.view === 'checklist');
  els.tabRoadmap.classList.toggle('active', state.view === 'roadmap');
}

const callbacks = {
  onToggleEarned(id, earned) {
    if (earned) state.earnedIds.add(id);
    else state.earnedIds.delete(id);
    persist();
    render();
  },
  onSelect(id) {
    state.selectedId = id;
    if (state.view !== 'checklist') state.view = 'checklist';
    persist();
    render();
  },
};

function setView(view) {
  state.view = view;
  persist();
  render();
  window.scrollTo({ top: 0 });
}

function wireToolbar() {
  els.search.addEventListener('input', () => {
    state.settings.query = els.search.value;
    persist();
    render();
  });
  els.kindFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    state.settings.kind = button.dataset.kind;
    for (const chip of els.kindFilters.querySelectorAll('.chip')) chip.classList.toggle('active', chip === button);
    persist();
    render();
  });
  els.gradeFilter.addEventListener('change', () => {
    state.settings.grade = els.gradeFilter.value;
    persist();
    render();
  });
  els.spoilerToggle.addEventListener('change', () => {
    state.settings.spoilerShield = els.spoilerToggle.checked;
    persist();
    render();
  });
  els.remainingToggle.addEventListener('change', () => {
    state.settings.onlyUnearned = els.remainingToggle.checked;
    persist();
    render();
  });
  els.exportBtn.addEventListener('click', () => downloadExport(state.earnedIds, state.trophies));
  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files[0];
    if (!file) return;
    try {
      state.earnedIds = parseImportedProgress(await file.text(), state.trophies);
      persist();
      render();
      els.listNote.textContent = `Imported progress: ${state.earnedIds.size} trophies marked as earned.`;
    } catch {
      els.listNote.textContent = 'That file could not be read as a progress export — nothing was changed.';
    }
    els.importInput.value = '';
  });
  els.tabChecklist.addEventListener('click', () => setView('checklist'));
  els.tabRoadmap.addEventListener('click', () => setView('roadmap'));
  document.getElementById('banner-roadmap-link').addEventListener('click', () => setView('roadmap'));
}

function syncToolbarFromSettings() {
  els.search.value = state.settings.query;
  els.gradeFilter.value = state.settings.grade;
  els.spoilerToggle.checked = state.settings.spoilerShield;
  els.remainingToggle.checked = state.settings.onlyUnearned;
  for (const chip of els.kindFilters.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.kind === state.settings.kind);
  }
}

// Deep links: #demo seeds the sample run (only when no progress is saved yet);
// #view=roadmap, #trophy=<id>, #kind=<kind>, #grade=<grade>, #spoiler=1 frame a view.
function applyHashDeepLink() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (params.has('demo') && !localStorage.getItem('leonida-legend-progress-v1')) {
    state.earnedIds = new Set(DEMO_EARNED_IDS);
    saveEarnedIds(state.earnedIds);
  }
  if (params.get('view') === 'roadmap') state.view = 'roadmap';
  if (params.has('kind')) state.settings.kind = params.get('kind');
  if (params.has('grade')) state.settings.grade = params.get('grade');
  if (params.get('spoiler') === '1') state.settings.spoilerShield = true;
  const trophyParam = Number(params.get('trophy'));
  if (Number.isInteger(trophyParam) && trophyParam >= 1) state.selectedId = trophyParam;
  if (!params.has('view') && state.settings.view) state.view = state.settings.view;
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  state.trophies = data.trophies;
  applyHashDeepLink();
  syncToolbarFromSettings();
  wireToolbar();
  render();
}

boot();
