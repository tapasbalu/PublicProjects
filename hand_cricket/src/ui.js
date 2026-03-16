/**
 * ui.js
 * IPL Edition — DOM manipulation, scorecard rendering, over summary, popups.
 */

import { ROLE_INFO, ROLE_ALLOWED_GESTURES } from './iplData.js';

const $ = (id) => document.getElementById(id);

const screens = {
  start: $('start-screen'),
  teamBuilder: $('team-builder-screen'),
  toss: $('toss-screen'),
  game: $('game-screen'),
  inningsBreak: $('innings-break-screen'),
  result: $('result-screen'),
};

const els = {
  // Toss
  coin: $('coin'),
  tossResult: $('toss-result'),
  btnToss: $('btn-toss'),
  tossTeams: $('toss-teams'),

  // Game
  inningsLabel: $('innings-label'),
  battingTeamName: $('batting-team-name'),
  battingTeamScore: $('batting-team-score'),
  battingTeamOvers: $('batting-team-overs'),
  bowlingTeamName: $('bowling-team-name'),
  bowlingTeamTarget: $('bowling-team-target'),
  btnPlayBall: $('btn-play-ball'),
  gestureBadge: $('gesture-badge'),

  // Current batsman
  batsmanNameDisplay: $('batsman-name-display'),
  batsmanRoleBadge: $('batsman-role-badge'),
  batsmanAllowed: $('batsman-allowed'),

  // Last ball
  lastBall: $('last-ball'),
  yourGestureDisplay: $('your-gesture-display'),
  cpuGestureDisplay: $('cpu-gesture-display'),
  ballResultText: $('ball-result-text'),

  // Over summary
  currentOverBalls: $('current-over-balls'),

  // Scorecard
  scorecardBody: $('scorecard-body'),

  // Over history
  overHistoryList: $('over-history-list'),

  // Countdown
  countdownOverlay: $('countdown-overlay'),
  countdownText: $('countdown-text'),

  // Innings break
  inningsSummary: $('innings-summary'),
  targetDisplay: $('target-display'),
  inningsScorecardPreview: $('innings-scorecard-preview'),
  btnNextInnings: $('btn-next-innings'),

  // Result
  resultTitle: $('result-title'),
  finalScores: $('final-scores'),
  resultMessage: $('result-message'),
  btnReplay: $('btn-replay'),

  // Popup
  popupOverlay: $('popup-overlay'),
  popupText: $('popup-text'),
};

/** Switch to a specific screen. */
export function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/** Update gesture badge. */
export function updateGestureBadge(value) {
  els.gestureBadge.textContent = value === -1 ? '✋ Show hand' : `Gesture: ${value}`;
}

/** Update current batsman info panel. */
export function updateBatsmanInfo(batsman) {
  if (!batsman) {
    els.batsmanNameDisplay.textContent = '—';
    els.batsmanRoleBadge.textContent = '—';
    els.batsmanAllowed.textContent = '';
    return;
  }
  const info = ROLE_INFO[batsman.role];
  const allowed = ROLE_ALLOWED_GESTURES[batsman.role];
  els.batsmanNameDisplay.textContent = `${info.emoji} ${batsman.name}`;
  els.batsmanRoleBadge.textContent = info.label;
  els.batsmanRoleBadge.className = `role-tag ${batsman.role}`;
  els.batsmanAllowed.textContent = `Allowed: ${allowed.join(', ')}`;
}

/** Compute overs string from total balls. */
function oversString(balls) {
  const o = Math.floor(balls / 6);
  const b = balls % 6;
  return `${o}.${b}`;
}

/** Update IPL-style score header. */
export function updateScoreHeader(game) {
  els.inningsLabel.textContent = game.innings === 1
    ? `1st Innings — ${game.state === 'BATTING' ? 'You Bat 🏏' : 'You Bowl 🎳'}`
    : `2nd Innings — ${game.state === 'BATTING' ? 'You Bat 🏏' : 'You Bowl 🎳'}`;

  els.battingTeamName.textContent = game.battingTeamName;
  els.battingTeamScore.textContent = game.totalScore;
  els.battingTeamOvers.textContent = `(${oversString(game.totalBalls)} ov)`;

  els.bowlingTeamName.textContent = game.bowlingTeamName;
  if (game.target !== null && game.innings === 2) {
    els.bowlingTeamTarget.textContent = `Target: ${game.target + 1}`;
  } else {
    els.bowlingTeamTarget.textContent = '';
  }
}

/** Update current over ball chips. */
export function updateCurrentOver(currentOverBalls) {
  els.currentOverBalls.innerHTML = currentOverBalls.map((b) => {
    let cls = 'over-ball-chip ';
    let text;
    if (b.isOut && b.isIllegal) {
      cls += 'illegal';
      text = '🚫';
    } else if (b.isOut) {
      cls += 'wicket';
      text = 'W';
    } else if (b.runs === 0) {
      cls += 'zero';
      text = '•';
    } else {
      cls += 'run';
      text = b.runs;
    }
    return `<span class="${cls}">${text}</span>`;
  }).join('');
}

/** Render the scorecard table. */
export function renderScorecard(scorecard, currentBatsmanIdx) {
  els.scorecardBody.innerHTML = scorecard.map((p, i) => {
    const info = ROLE_INFO[p.role];
    const isCurrent = i === currentBatsmanIdx && !p.isOut;
    const rowClass = p.isOut ? 'out-batsman' : isCurrent ? 'current-batsman' : '';
    const statusText = p.isOut ? p.outReason : isCurrent ? 'batting *' : 'yet to bat';
    const statusClass = p.isOut ? 'out' : isCurrent ? 'batting' : '';
    return `
      <tr class="${rowClass}">
        <td>${info.emoji} ${p.name}</td>
        <td style="color:${info.color};font-size:0.75rem">${info.label}</td>
        <td class="runs-col">${p.runs}</td>
        <td>${p.balls}</td>
        <td class="status-col ${statusClass}">${statusText}</td>
      </tr>
    `;
  }).join('');
}

/** Render over history. */
export function renderOverHistory(overs) {
  els.overHistoryList.innerHTML = overs.map((ov) => {
    const total = ov.balls.reduce((sum, b) => sum + (b.isOut ? 0 : b.runs), 0);
    const wickets = ov.balls.filter((b) => b.isOut).length;
    const chips = ov.balls.map((b) => {
      if (b.isOut) return `<span class="over-chip wicket">W</span>`;
      if (b.runs === 0) return `<span class="over-chip zero">•</span>`;
      return `<span class="over-chip run">${b.runs}</span>`;
    }).join('');
    return `
      <div class="over-row">
        <span class="over-label">Over ${ov.over}</span>
        <div class="over-chips">${chips}</div>
        <span class="over-total">${total} runs${wickets ? `, ${wickets}W` : ''}</span>
      </div>
    `;
  }).join('');
}

/** Show last ball result. */
export function showLastBall(playerGesture, cpuGesture, message, isOut) {
  els.lastBall.classList.remove('hidden');
  els.yourGestureDisplay.textContent = playerGesture;
  els.cpuGestureDisplay.textContent = cpuGesture;
  els.ballResultText.textContent = message;
  els.ballResultText.className = `ball-result-text ${isOut ? 'out' : 'runs'}`;
}

/** Clear ball log for new innings. */
export function clearBallLog() {
  els.lastBall.classList.add('hidden');
  els.currentOverBalls.innerHTML = '';
  els.overHistoryList.innerHTML = '';
}

/** Countdown animation. */
export function runCountdown() {
  return new Promise((resolve) => {
    els.countdownOverlay.classList.remove('hidden');
    const sequence = ['3', '2', '1', 'GO!'];
    let i = 0;
    function step() {
      if (i >= sequence.length) { els.countdownOverlay.classList.add('hidden'); resolve(); return; }
      els.countdownText.textContent = sequence[i];
      els.countdownText.style.animation = 'none';
      void els.countdownText.offsetHeight;
      els.countdownText.style.animation = '';
      i++;
      setTimeout(step, 700);
    }
    step();
  });
}

/** Popup animation. */
export function showPopup(text, type, duration = 1200) {
  return new Promise((resolve) => {
    els.popupText.textContent = text;
    els.popupText.className = `popup-text ${type}`;
    els.popupOverlay.classList.remove('hidden');
    els.popupText.style.animation = 'none';
    void els.popupText.offsetHeight;
    els.popupText.style.animation = '';
    setTimeout(() => { els.popupOverlay.classList.add('hidden'); resolve(); }, duration);
  });
}

/** Show innings break. */
export function showInningsBreak({ summary, target, scorecard }) {
  els.inningsSummary.textContent = summary;
  els.targetDisplay.textContent = `Target: ${target + 1} runs`;
  // Mini scorecard
  els.inningsScorecardPreview.innerHTML = `
    <table class="scorecard-table">
      <thead><tr><th>Batsman</th><th>R</th><th>B</th><th>Status</th></tr></thead>
      <tbody>
        ${scorecard.map((p) => {
          const info = ROLE_INFO[p.role];
          return `<tr class="${p.isOut ? 'out-batsman' : ''}">
            <td>${info.emoji} ${p.name}</td>
            <td class="runs-col">${p.runs}</td>
            <td>${p.balls}</td>
            <td class="status-col ${p.isOut ? 'out' : ''}">${p.isOut ? 'out' : 'not out'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
  showScreen('inningsBreak');
}

/** Show final result. */
export function showResult({ winner, team1Name, team2Name, team1Score, team2Score, message }) {
  els.resultTitle.textContent = winner === 'draw' ? '🤝 Match Tied!' : '🏏 Match Over!';
  els.finalScores.innerHTML = `
    <div class="score-card you"><span class="label">${team1Name}</span><span class="score">${team1Score}</span></div>
    <div class="vs">vs</div>
    <div class="score-card cpu"><span class="label">${team2Name}</span><span class="score">${team2Score}</span></div>
  `;
  els.resultMessage.textContent = message;
  els.resultMessage.className = `result-message ${winner === 'team1' ? 'win' : winner === 'team2' ? 'lose' : 'draw'}`;
  showScreen('result');
}

/** Disable/enable play ball button. */
export function setPlayBallDisabled(disabled) {
  els.btnPlayBall.disabled = disabled;
  els.btnPlayBall.style.opacity = disabled ? '0.5' : '1';
}

/** Toss animation. */
export function animateToss(playerWon, playerBats) {
  return new Promise((resolve) => {
    els.coin.classList.add('flipping');
    els.tossResult.textContent = '';
    setTimeout(() => {
      els.coin.classList.remove('flipping');
      const winText = playerWon ? 'You won the toss!' : 'Computer won the toss!';
      const batText = playerBats ? 'You bat first. 🏏' : 'Computer bats first. You bowl! 🎳';
      els.tossResult.textContent = `${winText} ${batText}`;
      setTimeout(resolve, 1500);
    }, 900);
  });
}

export { els, screens };
