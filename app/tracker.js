// The tracker: the checklist of all 55 trophies with official names, descriptions and grades,
// kind / grade / search filters, the spoiler shield, and the detail panel that shows each
// trophy's own-words guide with its sources named beside it.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

export function isStoryTrophy(trophy) {
  return trophy.kinds.includes('story');
}

// The spoiler shield hides a story trophy's name, description and guide until it is earned.
export function isMasked(trophy, earnedIds, settings) {
  return Boolean(settings.spoilerShield && isStoryTrophy(trophy) && !earnedIds.has(trophy.id));
}

export function trophyMatchesFilters(trophy, settings) {
  if (settings.kind === 'missable' && !trophy.missable) return false;
  if (settings.kind === 'online') return false; // the official list has no online trophies
  if (settings.kind !== 'all' && settings.kind !== 'missable' && !trophy.kinds.includes(settings.kind)) return false;
  if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
  if (settings.onlyUnearned && trophy._earned) return false;
  if (settings.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(settings.query.toLowerCase())) return false;
  }
  return true;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function badge(text, className) {
  return el('span', `badge ${className}`, text);
}

export function buildBadges(trophy) {
  const wrap = el('div', 'badges');
  wrap.append(badge(trophy.grade, `grade-${trophy.grade}`));
  for (const kind of trophy.kinds) {
    if (kind !== 'platinum') wrap.append(badge(KIND_LABELS[kind] ?? kind, 'kind'));
  }
  if (trophy.count) wrap.append(badge(`${trophy.countLabel}: ${trophy.count}`, 'count'));
  if (trophy.missable) wrap.append(badge('Missable', 'missable'));
  else if (trophy.watch) wrap.append(badge('Save watch', 'watch'));
  return wrap;
}

export function renderTrophyList(listEl, trophies, state, callbacks) {
  listEl.replaceChildren();
  const { earnedIds, settings } = state;
  let shown = 0;
  for (const trophy of trophies) {
    const earned = earnedIds.has(trophy.id);
    if (!trophyMatchesFilters({ ...trophy, _earned: earned }, settings)) continue;
    shown += 1;
    const masked = isMasked(trophy, earnedIds, settings);
    const row = el('li', `trophy-row grade-${trophy.grade}${earned ? ' earned' : ''}${masked ? ' hidden-row' : ''}${state.selectedId === trophy.id ? ' selected' : ''}`);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => callbacks.onToggleEarned(trophy.id, box.checked));

    const main = el('div', 'trophy-main');
    const name = el('div', 'trophy-name', masked ? 'Hidden trophy — story spoiler' : trophy.name);
    if (earned && !masked) name.append(el('span', 'done-mark', '✓ earned'));
    main.append(name);
    main.append(el('div', 'trophy-desc', masked ? 'A story trophy. The spoiler shield hides its name and description until you earn it.' : trophy.description));
    if (!masked) {
      const peek = trophy.guide.length > 150 ? `${trophy.guide.slice(0, 150)}…` : trophy.guide;
      main.append(el('div', 'trophy-guide-peek', peek));
    }
    main.append(buildBadges(trophy));

    const side = el('div', 'trophy-side');
    side.append(el('span', 'stage', `Roadmap stage ${trophy.stage}`), document.createTextNode(`#${trophy.id} of 55`));

    row.append(box, main, side);
    row.addEventListener('click', () => callbacks.onSelect(trophy.id));
    listEl.append(row);
  }
  return shown;
}

export function renderDetailPanel(panelEl, trophy, state, callbacks) {
  panelEl.replaceChildren();
  if (!trophy) {
    panelEl.append(
      el('h2', null, 'Pick a trophy'),
      el('p', 'empty-note', 'Select any trophy in the checklist to read its guide here — what to do, when it can be missed, and the sources every fact comes from. Tick trophies off as you earn them; progress is saved in this browser.'),
    );
    return;
  }
  const earned = state.earnedIds.has(trophy.id);
  const masked = isMasked(trophy, state.earnedIds, state.settings);

  panelEl.append(el('div', 'detail-grade', `${trophy.grade} · Roadmap stage ${trophy.stage} · #${trophy.id} of 55`));
  panelEl.append(el('h2', null, masked ? 'Hidden trophy — story spoiler' : trophy.name));
  panelEl.append(
    el('p', 'official-desc', masked ? 'The spoiler shield is on: this story trophy reveals itself once you earn it.' : `"${trophy.description}" — official PlayStation description`),
  );
  panelEl.append(buildBadges(trophy));

  if (trophy.missable) {
    const warn = el('div', 'warn-box');
    warn.append(el('b', null, 'MISSABLE. '), document.createTextNode(trophy.missableNote));
    panelEl.append(warn);
  } else if (trophy.watch) {
    const watch = el('div', 'watch-box');
    watch.append(el('b', null, 'SAVE WATCH. '), document.createTextNode(trophy.watch));
    panelEl.append(watch);
  }

  if (masked) {
    panelEl.append(el('p', 'guide-text', 'Guide hidden by the spoiler shield. Earn this trophy to reveal it here, or switch the shield off in the toolbar.'));
  } else {
    panelEl.append(el('p', 'guide-text', trophy.guide));
    const sources = el('p', 'sources-line');
    sources.append(el('b', null, 'Sources: '), document.createTextNode(trophy.sources));
    panelEl.append(sources);
  }

  const toggle = el('button', `earn-toggle${earned ? ' is-earned' : ''}`, earned ? '✓ Earned — tap to undo' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => callbacks.onToggleEarned(trophy.id, !earned));
  panelEl.append(toggle);
}

export function renderProgress(trophies, earnedIds, els) {
  const total = trophies.length;
  const done = earnedIds.size;
  els.count.textContent = `${done} of ${total} earned`;
  els.pct.textContent = `${Math.round((done / total) * 100)}%`;
  els.fill.style.width = `${(done / total) * 100}%`;
  els.grades.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earnedIds.has(t.id)).length;
    const span = el('span');
    span.append(document.createTextNode(`${grade[0].toUpperCase()}${grade.slice(1)} `), el('b', null, `${got}/${inGrade.length}`));
    els.grades.append(span);
  }
}
