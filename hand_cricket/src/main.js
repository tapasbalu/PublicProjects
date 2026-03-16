/**
 * main.js
 * IPL Edition — wires team builder, webcam, MediaPipe, game engine, and UI together.
 */

import { initHandDetector, detectHands, countFingers, drawLandmarks } from './handDetector.js';
import { createGameEngine } from './gameEngine.js';
import { renderTeamBuilder } from './teamBuilder.js';
import { ROLE_ALLOWED_GESTURES } from './iplData.js';
import {
  showScreen,
  updateGestureBadge,
  updateBatsmanInfo,
  updateScoreHeader,
  updateCurrentOver,
  renderScorecard,
  renderOverHistory,
  showLastBall,
  clearBallLog,
  runCountdown,
  showPopup,
  showInningsBreak,
  showResult,
  setPlayBallDisabled,
  animateToss,
  els,
} from './ui.js';

// --- State ---
let game = createGameEngine();
let video, canvas, ctx;
let currentGesture = -1;
let isProcessing = false;
let webcamInitialized = false;
let team1Data = null;
let team2Data = null;

// =============================================
// WEBCAM SETUP
// =============================================
async function setupWebcam() {
  if (webcamInitialized) return;
  video = document.getElementById('webcam');
  canvas = document.getElementById('overlay');
  ctx = canvas.getContext('2d');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
  });
  video.srcObject = stream;
  await new Promise((resolve) => { video.onloadedmetadata = () => { canvas.width = video.videoWidth; canvas.height = video.videoHeight; resolve(); }; });
  webcamInitialized = true;
}

// =============================================
// DETECTION LOOP
// =============================================
function startDetectionLoop() {
  function loop() {
    if (video && video.readyState >= 2) {
      const result = detectHands(video);
      if (result && result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];
        drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
        currentGesture = countFingers(landmarks);
      } else {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentGesture = -1;
      }
      updateGestureBadge(currentGesture);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// =============================================
// UPDATE ALL UI
// =============================================
function refreshGameUI() {
  updateScoreHeader(game);

  const batsman = game.getCurrentBatsman();
  updateBatsmanInfo(batsman ? { name: batsman.name, role: batsman.role } : null);

  renderScorecard(game.scorecard, game.scorecard.findIndex((p) => !p.isOut && game.scorecard.indexOf(p) >= 0));
  updateCurrentOver(game.currentOverBalls);
  renderOverHistory(game.overs);
}

// =============================================
// PLAY A SINGLE BALL
// =============================================
async function handlePlayBall() {
  if (isProcessing) return;
  if (game.state !== 'BATTING' && game.state !== 'BOWLING') return;

  isProcessing = true;
  setPlayBallDisabled(true);

  await runCountdown();

  const playerGesture = currentGesture === -1 ? 0 : currentGesture;
  const result = game.playBall(playerGesture);

  showLastBall(playerGesture, result.cpuGesture, result.message, result.isOut);
  refreshGameUI();

  // Popup for special events
  if (result.isIllegal) {
    await showPopup('ILLEGAL! 🚫', 'illegal');
  } else if (result.isOut) {
    const popupType = game.state === 'BOWLING' || game.innings === 2 ? 'wicket' : 'out';
    await showPopup(result.isOut ? 'OUT! 💥' : 'WICKET! 🎳', popupType);
  } else if (result.runs === 6) {
    await showPopup('SIX! 💥', 'six');
  } else if (result.runs === 4) {
    await showPopup('FOUR! 🔥', 'four');
  }

  // Handle transitions
  if (result.gameOver) {
    setTimeout(() => showResult(game.getResult()), 800);
  } else if (result.inningsOver) {
    setTimeout(() => {
      showInningsBreak({
        summary: `${game.battingTeamName} scored ${game.totalScore} runs.`,
        target: game.target,
        scorecard: game.scorecard,
      });
    }, 800);
  } else {
    isProcessing = false;
    setPlayBallDisabled(false);
  }
}

// =============================================
// EVENT LISTENERS
// =============================================
function bindEvents() {
  // Start → Team Builder
  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('teamBuilder');
    const container = document.getElementById('team-builder-container');
    renderTeamBuilder(container, (t1, t2) => {
      team1Data = t1;
      team2Data = t2;
      game.setTeams(t1, t2);
      els.tossTeams.textContent = `${t1.name} vs ${t2.name}`;
      showScreen('toss');
    });
  });

  // Toss
  els.btnToss.addEventListener('click', async () => {
    els.btnToss.disabled = true;
    const { playerWon, playerBats } = game.toss();
    await animateToss(playerWon, playerBats);

    await setupWebcam();
    await initHandDetector();
    startDetectionLoop();

    showScreen('game');
    refreshGameUI();
    setPlayBallDisabled(false);
    els.btnToss.disabled = false;
  });

  // Play ball
  els.btnPlayBall.addEventListener('click', handlePlayBall);

  // Next innings
  els.btnNextInnings.addEventListener('click', () => {
    game.startSecondInnings();
    clearBallLog();
    showScreen('game');
    refreshGameUI();
    isProcessing = false;
    setPlayBallDisabled(false);
  });

  // Replay
  document.getElementById('btn-replay').addEventListener('click', () => {
    game.reset();
    clearBallLog();
    // Re-render team builder
    showScreen('teamBuilder');
    const container = document.getElementById('team-builder-container');
    renderTeamBuilder(container, (t1, t2) => {
      team1Data = t1;
      team2Data = t2;
      game.setTeams(t1, t2);
      els.tossTeams.textContent = `${t1.name} vs ${t2.name}`;
      showScreen('toss');
    });
  });

  // Space to play ball
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.getElementById('game-screen').classList.contains('active')) {
      e.preventDefault();
      handlePlayBall();
    }
  });
}

bindEvents();
