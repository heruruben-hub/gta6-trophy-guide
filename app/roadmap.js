// The platinum roadmap: six stages built from the official trophy descriptions — which chapters and
// missions, which collectibles and counts, in what order — plus the golden rules and the missable /
// save-watch cards. Every factual claim names its source, like the guides do.

export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Chapter 1 — start clean, protect the one missable',
    text: 'Play the opening: Gone Fishing (Just Like Paradise) and the rest of Chapter 1 (Paradise Lost). Before the chapter closes, do the house meditation for Positive Mental Attitude — a meditation spot offered only in Chapter 1 is the one missable step in the entire run. Start the save discipline now: a manual save at the start of every chapter, and no cheats on this save, ever.',
    source: 'Sources: official trophy descriptions; Output Lag (Chapter 1 meditation disappears); Keen Gamer (chapter saves); GTABase (cheats disable trophies and saving).',
  },
  {
    n: 2,
    title: 'Chapters 2–4 — the campaign spine',
    text: 'Both protagonists are playable together from Chapter 2 (T**s Ass Drug Money), which unlocks the partner trophies. Play every named story mission as it appears — Breakfast Run, The Cartel Heist, Child\'s Play, Headliners, VCIA Takedown, Operation Savage Glory — because there is no mission replay to return with. Sample each of the 9 activity types once for Master of None, grab the VCIA moment for Catch Me If You Can while you are at the airport, and save before big choices (Actions Speak Louder).',
    source: 'Sources: official trophy descriptions; Keen Gamer (no mission replay); Output Lag (duo playable from Chapter 2; robberies open in Chapters 3–4).',
  },
  {
    n: 3,
    title: 'The finale — then free roam',
    text: 'Finish the final mission (You Gotta Know When to Get Off, gold) with a manual save banked just before it. The credits are not the end: free roam continues, so the duo feats (Hot Together, Retail Therapy), the combat feats (Gunslinger, Challenging Tank), the robbery one-offs (Sneakthief, A Classic Blitz Play) and the oddball Leonida moments (the Ocean Beach cocktail, the showroom exit, bowling, the strange event) are all safe to mop up here.',
    source: 'Sources: official trophy descriptions; GTA Vibes (free roam after the credits).',
  },
  {
    n: 4,
    title: 'Strangers & strands — finish every storyline',
    text: 'Complete the character strands end to end: Andy, Kenton, Billy, Randy and Tyrone each end in a final-mission trophy, and Bret\'s strand ends with the unique-animal hunt of Fair Game. Eight completed strands unlock Strangers & Freaks (silver). Cal\'s fishing challenge, Baited My Tackle, belongs to this social lap of the run as well.',
    source: 'Sources: official trophy descriptions (the strand finales and the 8-strand count).',
  },
  {
    n: 5,
    title: 'The 100% checklist — the long grinds',
    text: 'Open Progress > Stats > 100% Completion and work the checklist: gold in all 42 Shooting Range challenges, wins at all 14 Top Fun drone locations, 20 different races, 250 stunts, Challenges (50 for One Last Thing; 70 of the 80 for the checklist itself), 3 Collectible Card sets, 100 WAiNK locations, 100 vehicles discovered, all 52 areas explored, 5 Bank Vaults, one Illegal Operation per each of the 9 gangs, all 8 garage properties, $250,000 of Marked Bills laundered and $100,000 spent. When the checklist reaches 100%, A Long Road (gold) lands.',
    source: 'Sources: official trophy descriptions and their tracked counts; GTABase (100% checklist contents); GTA Vibes (70 of 80 Challenges).',
  },
  {
    n: 6,
    title: 'Platinum — Vice Got a Price!',
    text: 'When the other 54 trophies are in, the platinum unlocks on its own. Budget roughly 200 hours in total at about 4/10 difficulty: this platinum is a marathon of Leonida, not a test of skill.',
    source: 'Sources: official trophy description; Keen Gamer (about 200 hours, 4/10 difficulty).',
  },
];

export const GOLDEN_RULES = [
  {
    title: 'No mission replay',
    text: 'GTA VI has no mission replay and no New Game+. A manual save at the start and end of every chapter is your only way back to a missed moment.',
    source: 'Keen Gamer; GTABase',
  },
  {
    title: 'One missable step',
    text: 'Positive Mental Attitude: a meditation spot at the house in Chapter 1 disappears when the chapter ends. Do it before you finish Chapter 1.',
    source: 'Output Lag; Keen Gamer',
  },
  {
    title: 'Cheats off, always',
    text: 'Using a cheat disables trophies and saving for the run. Keep cheats off the platinum save entirely.',
    source: 'GTABase; GTA Vibes',
  },
  {
    title: 'One playthrough is enough',
    text: 'No online trophies, no difficulty trophies, no mission medals: all 55 are single-player, and free roam continues after the credits for cleanup.',
    source: 'GTA Vibes; Push Square (list reveal)',
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function renderGoldenRules(container) {
  container.replaceChildren();
  for (const rule of GOLDEN_RULES) {
    const card = el('div', 'rule-card');
    card.append(el('b', null, rule.title), el('span', null, rule.text), el('span', 'rule-source', `Source: ${rule.source}`));
    container.append(card);
  }
}

export function renderRoadmapStages(container, trophies, earnedIds, isMasked, onPickTrophy) {
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const card = el('article', 'stage-card');
    const heading = el('h3');
    heading.append(el('span', 'stage-n', String(stage.n)), document.createTextNode(stage.title));
    card.append(heading, el('p', 'stage-text', stage.text));
    const list = el('ul', 'stage-trophies');
    for (const trophy of trophies.filter((t) => t.stage === stage.n)) {
      const item = el('li', earnedIds.has(trophy.id) ? 'is-earned' : '');
      const masked = isMasked(trophy);
      item.append(
        el('span', 'st-name', masked ? 'Hidden trophy (spoiler shield)' : trophy.name),
        el('span', 'st-grade', trophy.grade),
      );
      if (earnedIds.has(trophy.id)) item.title = 'Earned';
      item.addEventListener('click', () => onPickTrophy(trophy.id));
      list.append(item);
    }
    card.append(list, el('p', 'stage-source', stage.source));
    container.append(card);
  }
}

export function renderWatchSection(container, trophies, onPickTrophy) {
  container.replaceChildren();
  container.append(el('h3', null, 'Missable & save-watch — read before you play'));
  const intro = el(
    'p',
    null,
    'Built from the official descriptions and the launch guides that cite them: exactly one trophy is missable, and four more are one-off story beats worth a manual save. Everything else on the list can be finished after the story.',
  );
  container.append(intro);
  const grid = el('div', 'watch-grid');
  const watched = trophies.filter((t) => t.missable || t.watch);
  for (const trophy of watched) {
    const card = el('div', `watch-card${trophy.missable ? ' missable' : ''}`);
    const head = el('div');
    head.append(
      el('span', 'watch-name', trophy.name),
      el('span', 'watch-tag', trophy.missable ? 'Missable' : 'Save watch'),
    );
    card.append(head, el('p', null, trophy.missable ? trophy.missableNote : trophy.watch));
    card.addEventListener('click', () => onPickTrophy(trophy.id));
    grid.append(card);
  }
  container.append(grid);
}
