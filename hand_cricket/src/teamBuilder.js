/**
 * teamBuilder.js
 * Team creation UI: select players from IPL squads, enforce composition, save/load localStorage.
 */

import { IPL_TEAMS, ROLE_INFO, TEAM_TOTAL } from './iplData.js';

const STORAGE_KEY = 'hand_cricket_saved_teams';

/**
 * @typedef {{ name: string, role: string }} Player
 * @typedef {{ name: string, players: Player[] }} SavedTeam
 */

/**
 * Save two teams to localStorage.
 * @param {SavedTeam} team1
 * @param {SavedTeam} team2
 */
export function saveTeams(team1, team2) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ team1, team2 }));
}

/**
 * Load saved teams from localStorage.
 * @returns {{ team1: SavedTeam, team2: SavedTeam } | null}
 */
export function loadSavedTeams() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Validate team — just need exactly TEAM_TOTAL players (any role mix).
 * @param {Player[]} players
 * @returns {{ valid: boolean, counts: object, errors: string[] }}
 */
export function validateTeam(players) {
  const counts = { batsman: 0, wicketkeeper: 0, allrounder: 0, bowler: 0 };
  for (const p of players) {
    counts[p.role] = (counts[p.role] || 0) + 1;
  }
  const errors = [];
  if (players.length !== TEAM_TOTAL) {
    errors.push(`Need exactly ${TEAM_TOTAL} players (have ${players.length})`);
  }
  return { valid: errors.length === 0, counts, errors };
}

/**
 * Get all players from all teams as a flat list with team info.
 * @returns {Array<Player & { team: string, teamShort: string }>}
 */
export function getAllPlayers() {
  const all = [];
  for (const team of IPL_TEAMS) {
    for (const p of team.players) {
      all.push({ ...p, team: team.name, teamShort: team.short, teamColor: team.color });
    }
  }
  return all;
}

/**
 * Render the team builder screen into the given container.
 * @param {HTMLElement} container
 * @param {(team1: SavedTeam, team2: SavedTeam) => void} onTeamsReady
 */
export function renderTeamBuilder(container, isMultiplayer, onTeamsReady) {
  /** @type {Player[]} */
  let team1Players = [];
  /** @type {Player[]} */
  let team2Players = [];
  let team1Name = isMultiplayer ? 'My Team' : 'Team 1';
  let team2Name = 'Team 2';
  let activeTeam = 1; // 1 or 2
  let filterFranchise = 'ALL';
  let filterRole = 'ALL';

  // Load saved teams
  const saved = loadSavedTeams();
  if (saved) {
    team1Players = saved.team1.players;
    team1Name = saved.team1.name;
    if (!isMultiplayer) {
      team2Players = saved.team2.players;
      team2Name = saved.team2.name;
    }
  }

  function render() {
    const allPlayers = getAllPlayers();
    const selectedNames = new Set([
      ...team1Players.map((p) => p.name),
      ...team2Players.map((p) => p.name),
    ]);

    let filteredPlayers = allPlayers.filter((p) => !selectedNames.has(p.name));
    if (filterFranchise !== 'ALL') {
      filteredPlayers = filteredPlayers.filter((p) => p.teamShort === filterFranchise);
    }
    if (filterRole !== 'ALL') {
      filteredPlayers = filteredPlayers.filter((p) => p.role === filterRole);
    }

    const v1 = validateTeam(team1Players);
    const v2 = isMultiplayer ? { valid: true, errors: [] } : validateTeam(team2Players);
    const bothValid = v1.valid && v2.valid;

    container.innerHTML = `
      <div class="tb-wrapper">
        <h2 class="tb-title">${isMultiplayer ? '🏏 Build Your Team' : '🏏 Build Your Teams'}</h2>
        <p class="tb-subtitle">Pick any 10 players — more bowlers = stronger bowling attack!</p>

        <div class="tb-teams-row ${isMultiplayer ? 'single-team' : ''}">
          <!-- Team 1 -->
          <div class="tb-team-card ${activeTeam === 1 ? 'active' : ''}" data-team="1">
            <div class="tb-team-header">
              <input class="tb-team-name-input" value="${team1Name}" data-team-input="1" placeholder="${isMultiplayer ? 'Your Team Name' : 'Team 1 Name'}" />
              <span class="tb-team-count ${v1.valid ? 'valid' : ''}">${team1Players.length}/10</span>
            </div>
            <div class="tb-team-roster" id="roster-1">
              ${team1Players.map((p, i) => `
                <div class="tb-roster-player">
                  <span class="tb-role-badge" style="background:${ROLE_INFO[p.role].color}20;color:${ROLE_INFO[p.role].color}">${ROLE_INFO[p.role].emoji}</span>
                  <span class="tb-player-name">${p.name}</span>
                  <button class="tb-remove-btn" data-remove="1" data-idx="${i}">✕</button>
                </div>
              `).join('')}
            </div>
            ${v1.errors.length ? `<div class="tb-errors">${v1.errors.join(' • ')}</div>` : ''}
          </div>

          <!-- Team 2 (Hidden if Multiplayer) -->
          ${!isMultiplayer ? `
          <div class="tb-team-card ${activeTeam === 2 ? 'active' : ''}" data-team="2">
            <div class="tb-team-header">
              <input class="tb-team-name-input" value="${team2Name}" data-team-input="2" placeholder="Team 2 Name" />
              <div style="display: flex; gap: 8px; align-items: center;">
                <button id="tb-randomize-cpu" class="btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;">🎲 Random CPU</button>
                <span class="tb-team-count ${v2.valid ? 'valid' : ''}">${team2Players.length}/10</span>
              </div>
            </div>
            <div class="tb-team-roster" id="roster-2">
              ${team2Players.map((p, i) => `
                <div class="tb-roster-player">
                  <span class="tb-role-badge" style="background:${ROLE_INFO[p.role].color}20;color:${ROLE_INFO[p.role].color}">${ROLE_INFO[p.role].emoji}</span>
                  <span class="tb-player-name">${p.name}</span>
                  <button class="tb-remove-btn" data-remove="2" data-idx="${i}">✕</button>
                </div>
              `).join('')}
            </div>
            ${v2.errors.length ? `<div class="tb-errors">${v2.errors.join(' • ')}</div>` : ''}
          </div>
          ` : ''}
        </div>

        <!-- Filters -->
        <div class="tb-filters">
          <span class="tb-filter-label">Adding to: <strong>${activeTeam === 1 ? team1Name : team2Name}</strong></span>
          <select id="filter-franchise" class="tb-select">
            <option value="ALL">All Franchises</option>
            ${IPL_TEAMS.map((t) => `<option value="${t.short}" ${filterFranchise === t.short ? 'selected' : ''}>${t.short} - ${t.name}</option>`).join('')}
          </select>
          <select id="filter-role" class="tb-select">
            <option value="ALL">All Roles</option>
            <option value="batsman" ${filterRole === 'batsman' ? 'selected' : ''}>🏏 Batsman</option>
            <option value="wicketkeeper" ${filterRole === 'wicketkeeper' ? 'selected' : ''}>🧤 Wicketkeeper</option>
            <option value="allrounder" ${filterRole === 'allrounder' ? 'selected' : ''}>⚡ All-Rounder</option>
            <option value="bowler" ${filterRole === 'bowler' ? 'selected' : ''}>🎳 Bowler</option>
          </select>
        </div>

        <!-- Player Pool -->
        <div class="tb-pool">
          ${filteredPlayers.map((p) => `
            <div class="tb-pool-player" data-player="${p.name}" data-role="${p.role}">
              <span class="tb-role-badge" style="background:${ROLE_INFO[p.role].color}20;color:${ROLE_INFO[p.role].color}">${ROLE_INFO[p.role].emoji}</span>
              <span class="tb-player-name">${p.name}</span>
              <span class="tb-franchise-tag" style="border-color:${p.teamColor}">${p.teamShort}</span>
            </div>
          `).join('')}
          ${filteredPlayers.length === 0 ? '<p class="tb-empty">No players available with this filter.</p>' : ''}
        </div>

        <div class="tb-actions">
          <button id="tb-save-btn" class="btn-secondary" ${!bothValid ? '' : ''}>💾 Save Teams</button>
          <button id="tb-start-btn" class="btn-primary" ${bothValid ? '' : 'disabled'}>Start Match 🏏</button>
        </div>
      </div>
    `;

    // --- Event Binding ---

    // Team card click to switch active
    container.querySelectorAll('.tb-team-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.tb-remove-btn') || e.target.closest('.tb-team-name-input')) return;
        activeTeam = parseInt(card.dataset.team);
        render();
      });
    });

    // Team name inputs
    container.querySelectorAll('.tb-team-name-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        if (e.target.dataset.teamInput === '1') team1Name = e.target.value;
        else if (!isMultiplayer) team2Name = e.target.value;
      });
    });

    // Remove buttons
    container.querySelectorAll('.tb-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const teamNum = parseInt(btn.dataset.remove);
        const idx = parseInt(btn.dataset.idx);
        if (teamNum === 1) team1Players.splice(idx, 1);
        else if (!isMultiplayer) team2Players.splice(idx, 1);
        render();
      });
    });

    // Player pool click to add
    container.querySelectorAll('.tb-pool-player').forEach((el) => {
      el.addEventListener('click', () => {
        const name = el.dataset.player;
        const role = el.dataset.role;
        const target = activeTeam === 1 ? team1Players : team2Players;
        if (target === team2Players && isMultiplayer) return; // safeguard
        if (target.length >= 10) return;
        target.push({ name, role });
        render();
      });
    });

    // Filters
    const franchiseSelect = container.querySelector('#filter-franchise');
    const roleSelect = container.querySelector('#filter-role');
    if (franchiseSelect) {
      franchiseSelect.addEventListener('change', (e) => {
        filterFranchise = e.target.value;
        render();
      });
    }
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        filterRole = e.target.value;
        render();
      });
    }

    // Save button
    const saveBtn = container.querySelector('#tb-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveTeams({ name: team1Name, players: team1Players }, { name: team2Name, players: team2Players });
        saveBtn.textContent = '✅ Saved!';
        setTimeout(() => { saveBtn.textContent = '💾 Save Teams'; }, 1500);
      });
    }

    // Random CPU button
    const randomBtn = container.querySelector('#tb-randomize-cpu');
    if (randomBtn && !isMultiplayer) {
      randomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const allPlayers = getAllPlayers();
        const t1Names = new Set(team1Players.map(p => p.name));
        const available = allPlayers.filter(p => !t1Names.has(p.name));
        
        // Shuffle helper
        const shuffle = (array) => {
          let curr = array.length, rand;
          while (curr != 0) {
            rand = Math.floor(Math.random() * curr);
            curr--;
            [array[curr], array[rand]] = [array[rand], array[curr]];
          }
          return array;
        };

        const bats = shuffle(available.filter(p => p.role === 'batsman' || p.role === 'wicketkeeper'));
        const bowls = shuffle(available.filter(p => p.role === 'bowler'));
        const allr = shuffle(available.filter(p => p.role === 'allrounder'));

        team2Players = [
          ...bats.slice(0, 5),
          ...allr.slice(0, 2),
          ...bowls.slice(0, 3)
        ].map(p => ({ name: p.name, role: p.role }));
        
        render();
      });
    }

    // Start button
    const startBtn = container.querySelector('#tb-start-btn');
    if (startBtn && bothValid) {
      startBtn.addEventListener('click', () => {
        saveTeams({ name: team1Name, players: team1Players }, { name: team2Name, players: team2Players });
        onTeamsReady(
          { name: team1Name, players: team1Players },
          { name: team2Name, players: team2Players }
        );
      });
    }
  }

  render();
}
