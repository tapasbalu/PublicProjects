/**
 * main.js
 * IPL Edition — wires team builder, webcam, MediaPipe, game engine, UI, and multiplayer together.
 */

import { initHandDetector, detectHands, countFingers, drawLandmarks } from './handDetector.js';
import { createGameEngine } from './gameEngine.js';
import { renderTeamBuilder } from './teamBuilder.js';
import { ROLE_ALLOWED_GESTURES } from './iplData.js';
import {
  initMultiplayer, createRoom, joinRoom, notifyTeamsReady, sendPlayBall,
  isMultiplayer, isPlayer1, roomCode
} from './multiplayer.js';
import {
  showScreen,
  updateGestureBadge,
  updateBatsmanInfo,
  updateBowlerInfo,
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

  const bowler = game.getCurrentBowler();
  const bowlerPower = game.getCurrentBowlerPower();
  updateBowlerInfo(bowler, bowlerPower, game.isSpecialDelivery, game.specialDeliveryType);

  renderScorecard(game.scorecard, game.scorecard.findIndex((p) => !p.isOut && game.scorecard.indexOf(p) >= 0));
  updateCurrentOver(game.currentOverBalls);
  renderOverHistory(game.overs);
}

// =============================================
// MULTIPLAYER CALLBACKS
// =============================================
initMultiplayer({
  onRoomCreated: (code) => {
    els.roomStatus.innerHTML = `<span style="display:block; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">Room created! Share this code:</span><span style="display:block; font-size: 2.5rem; font-weight: 900; color: var(--accent-green); letter-spacing: 4px; border: 2px dashed rgba(0,230,118,0.5); padding: 10px; border-radius: var(--radius-sm); background: rgba(0,230,118,0.1);">${code}</span><span style="display:block; font-size: 0.8rem; margin-top: 8px; color: var(--text-secondary);">Waiting for opponent...</span>`;
    els.btnCreateRoom.classList.add('hidden');
    document.querySelector('.join-room-row').classList.add('hidden');
  },
  onRoomJoined: (code) => {
    els.roomStatus.textContent = `Joined room ${code}! Waiting for host...`;
  },
  onError: (msg) => {
    els.roomStatus.textContent = `Error: ${msg}`;
    setTimeout(() => { els.roomStatus.textContent = ''; }, 3000);
  },
  onMatchReady: (msg) => {
    // Both players in room, go to team builder
    showScreen('teamBuilder');
    const container = document.getElementById('team-builder-container');
    renderTeamBuilder(container, isMultiplayer, (t1, t2) => {
      // In multiplayer, you only select "Team 1" for yourself
      // Both t1 and t2 are returned from the UI, but we'll send t1 as our team
      els.roomStatus.textContent = 'Team selected! Waiting for opponent...';
      els.roomStatus.classList.remove('hidden');
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('team-builder-screen').classList.add('active'); // stay on screen but wait
      
      notifyTeamsReady(t1);
    });
  },
  onStartToss: (data) => {
    // Both players submitted teams
    const p1Team = data.p1Team;
    const p2Team = data.p2Team;
    team1Data = isPlayer1 ? p1Team : p2Team;
    team2Data = isPlayer1 ? p2Team : p1Team;
    game.setTeams(team1Data, team2Data);
    els.tossTeams.textContent = `${team1Data.name} vs ${team2Data.name}`;
    
    // In multiplayer, toss is automated or handled here
    // Let's have Toss just show Teams, and Player 1 starts batting for simplicity
    showScreen('toss');
    els.btnToss.textContent = isPlayer1 ? 'Start Match (Bat First)' : 'Start Match (Bowl First)';
    els.btnToss.onclick = async () => {
      els.btnToss.disabled = true;
      els.tossResult.textContent = isPlayer1 ? 'You bat first!' : 'You bowl first!';
      setTimeout(async () => {
        // Player 1 bats first
        game.toss(); // Sets state internally
        if (!isPlayer1) {
          game.startSecondInnings(); // Force P2 to bowling state initially? Wait, toss randomly returns.
          // Actually, if we use a shared seed or server decider...
          // For simplicity, let's reset game and force P1 to bat
        }
      }, 500);
    };
  },
  onBallResult: async (data) => {
    const localGesture = isPlayer1 ? data.p1Gesture : data.p2Gesture;
    const remoteGesture = isPlayer1 ? data.p2Gesture : data.p1Gesture;
    
    const result = game.playBall(localGesture, remoteGesture);
    await processBallOutcome(localGesture, remoteGesture, result);
  },
  onOpponentLeft: (msg) => {
    alert(msg);
    location.reload();
  }
});

// =============================================
// BALL OUTCOME PROCESSING (SP & MP)
// =============================================
async function processBallOutcome(playerGesture, cpuGesture, result) {
  showLastBall(playerGesture, cpuGesture, result.message, result.isOut);
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
    if (isMultiplayer) els.btnPlayBall.textContent = 'Play Ball (Space) 🏏';
  }
}

// =============================================
// PLAY A SINGLE BALL
// =============================================
async function handlePlayBall(fromSpacebar = false) {
  if (isProcessing) return;
  if (game.state !== 'BATTING' && game.state !== 'BOWLING') return;

  isProcessing = true;
  setPlayBallDisabled(true);

  if (!fromSpacebar) {
    await runCountdown();
  }
  
  const playerGesture = currentGesture === -1 ? 0 : currentGesture;

  if (isMultiplayer) {
    els.btnPlayBall.textContent = 'Waiting for opponent...';
    sendPlayBall(playerGesture);
  } else {
    const result = game.playBall(playerGesture);
    await processBallOutcome(playerGesture, result.cpuGesture, result);
  }
}

// =============================================
// EVENT LISTENERS
// =============================================
function bindEvents() {
  // Multiplayer Start
  els.btnCreateRoom.addEventListener('click', () => {
    createRoom();
  });
  els.btnJoinRoom.addEventListener('click', () => {
    const code = els.joinRoomInput.value.trim();
    if (code.length === 4) joinRoom(code);
  });

  // Single Player Start → Team Builder
  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('teamBuilder');
    const container = document.getElementById('team-builder-container');
    renderTeamBuilder(container, isMultiplayer, (t1, t2) => {
      team1Data = t1;
      team2Data = t2;
      game.setTeams(t1, t2);
      els.tossTeams.textContent = `${t1.name} vs ${t2.name}`;
      showScreen('toss');
    });
  });

  // Instructions Modal
  document.getElementById('btn-how-to-play').addEventListener('click', () => {
    document.getElementById('instructions-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-instructions').addEventListener('click', () => {
    document.getElementById('instructions-modal').classList.add('hidden');
  });

  // Toss
  els.btnToss.addEventListener('click', async () => {
    if (isMultiplayer) {
      game.reset();
      game.setTeams(team1Data, team2Data);
      // Hardcoded for MP: P1 bats first
      game.setServerTossOverride(isPlayer1); 
    } else {
      els.btnToss.disabled = true;
      const { playerWon, playerBats } = game.toss();
      await animateToss(playerWon, playerBats);
    }

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
    if (isMultiplayer) els.btnPlayBall.textContent = 'Play Ball! 🏏';
  });

  // Replay
  document.getElementById('btn-replay').addEventListener('click', () => {
    if (isMultiplayer) {
      alert("Multiplayer replay not supported yet. Please refresh.");
      location.reload();
      return;
    }
    game.reset();
    clearBallLog();
    showScreen('teamBuilder');
    const container = document.getElementById('team-builder-container');
    renderTeamBuilder(container, isMultiplayer, (t1, t2) => {
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
      handlePlayBall(true);
    }
  });
}

bindEvents();
