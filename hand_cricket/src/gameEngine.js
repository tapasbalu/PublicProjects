/**
 * gameEngine.js
 * IPL Edition — State machine, role-based restrictions, bowler power, over tracking, individual scorecards.
 */

import { ROLE_ALLOWED_GESTURES, BOWLER_POWER } from './iplData.js';

/**
 * @typedef {'IDLE'|'TOSS'|'BATTING'|'BOWLING'|'INNINGS_BREAK'|'RESULT'} GameState
 * @typedef {{ name: string, role: string, runs: number, balls: number, isOut: boolean, outReason: string }} BatsmanScore
 * @typedef {{ over: number, balls: Array<{runs: number, isOut: boolean, isIllegal: boolean, isSpecialDelivery: boolean, bowlerName: string}> }} OverSummary
 */

/**
 * Create batting order: batsmen/wk first → all-rounders → bowlers.
 */
function buildBattingOrder(players) {
  return [
    ...players.filter((p) => p.role === 'batsman' || p.role === 'wicketkeeper'),
    ...players.filter((p) => p.role === 'allrounder'),
    ...players.filter((p) => p.role === 'bowler'),
  ];
}

/**
 * Create bowling rotation: bowlers first → all-rounders → batsmen.
 * Each bowler bowls one over in rotation.
 */
function buildBowlingOrder(players) {
  return [
    ...players.filter((p) => p.role === 'bowler'),
    ...players.filter((p) => p.role === 'allrounder'),
    ...players.filter((p) => p.role === 'batsman' || p.role === 'wicketkeeper'),
  ];
}

/**
 * Creates a new game engine instance.
 */
export function createGameEngine() {
  /** @type {GameState} */
  let state = 'IDLE';
  let innings = 1;
  let target = null;

  // Teams
  let team1 = null;
  let team2 = null;
  let playerBatsFirst = true;

  // Current innings tracking
  let battingTeamName = '';
  let bowlingTeamName = '';
  let battingOrder = [];
  let bowlingOrder = [];
  let currentBatsmanIdx = 0;
  let currentBowlerIdx = 0;
  let totalScore = 0;
  let totalBalls = 0;

  // First innings storage (for result calculation)
  let firstInningsScore = 0;
  let firstInningsScorecard = [];

  /** @type {BatsmanScore[]} */
  let scorecard = [];

  /** @type {OverSummary[]} */
  let overs = [];
  let currentOverBalls = [];

  /** @type {Array} */
  let ballLog = [];

  // Special delivery state
  let isSpecialDelivery = false;
  let specialDeliveryType = '';

  function setTeams(t1, t2) {
    team1 = t1;
    team2 = t2;
  }

  function initInnings(team1Bats) {
    const battingTeam = team1Bats ? team1 : team2;
    const bowlTeam = team1Bats ? team2 : team1;
    battingTeamName = battingTeam.name;
    bowlingTeamName = bowlTeam.name;
    battingOrder = buildBattingOrder(battingTeam.players);
    bowlingOrder = buildBowlingOrder(bowlTeam.players);
    currentBatsmanIdx = 0;
    currentBowlerIdx = 0;
    totalScore = 0;
    totalBalls = 0;
    currentOverBalls = [];
    overs = [];
    ballLog = [];
    isSpecialDelivery = false;
    specialDeliveryType = '';

    scorecard = battingOrder.map((p) => ({
      name: p.name,
      role: p.role,
      runs: 0,
      balls: 0,
      isOut: false,
      outReason: '',
    }));
  }

  function toss() {
    const playerWon = Math.random() < 0.5;
    playerBatsFirst = playerWon;
    state = 'BATTING';
    innings = 1;
    target = null;
    firstInningsScore = 0;
    firstInningsScorecard = [];
    initInnings(playerBatsFirst);
    return { playerWon, playerBats: playerBatsFirst };
  }

  /** Get current bowler power stats. */
  function getCurrentBowler() {
    if (!bowlingOrder.length) return null;
    const idx = currentBowlerIdx % bowlingOrder.length;
    return bowlingOrder[idx];
  }

  function getCurrentBowlerPower() {
    const bowler = getCurrentBowler();
    if (!bowler) return BOWLER_POWER.batsman;
    return BOWLER_POWER[bowler.role] || BOWLER_POWER.batsman;
  }

  /**
   * Generate CPU play, capped by bowler accuracy when CPU fields.
   */
  function cpuPlay() {
    return Math.floor(Math.random() * 7);
  }

  function getCurrentBatsman() {
    if (currentBatsmanIdx >= scorecard.length) return null;
    return scorecard[currentBatsmanIdx];
  }

  /**
   * Check if a special delivery triggers this ball.
   * Returns { isSpecial, type } where type = 'yorker' | 'bouncer' | null
   */
  function rollSpecialDelivery() {
    const power = getCurrentBowlerPower();
    if (Math.random() < power.specialDeliveryChance) {
      const type = Math.random() < 0.5 ? 'yorker' : 'bouncer';
      return { isSpecial: true, type };
    }
    return { isSpecial: false, type: null };
  }

  /**
   * Play a single ball.
   */
  function playBall(playerGesture) {
    const cpuGesture = cpuPlay();
    const batsman = getCurrentBatsman();
    const bowler = getCurrentBowler();
    const bowlerPower = getCurrentBowlerPower();

    if (!batsman) {
      return { cpuGesture, runs: 0, isOut: true, isIllegal: false, isSpecialDelivery: false, specialDeliveryType: '', message: 'All out!', gameOver: true, inningsOver: true, batsmanName: '', outReason: 'all out', bowlerName: bowler?.name || '' };
    }

    totalBalls++;
    batsman.balls++;

    let runs = 0;
    let isOut = false;
    let isIllegal = false;
    let message = '';
    let gameOver = false;
    let inningsOver = false;
    let outReason = '';
    let ballIsSpecial = isSpecialDelivery;
    let ballSpecialType = specialDeliveryType;

    // Reset special delivery state after capturing it
    isSpecialDelivery = false;
    specialDeliveryType = '';

    if (state === 'BATTING') {
      // --- Player is batting ---

      // 1. Check role-based restriction
      const allowed = ROLE_ALLOWED_GESTURES[batsman.role];
      if (!allowed.includes(playerGesture)) {
        isOut = true;
        isIllegal = true;
        outReason = `Illegal! ${batsman.role}s: ${allowed.join(',')} only`;
        message = `🚫 ILLEGAL! ${batsman.name} OUT!`;
      }
      // 2. Check special delivery restriction
      else if (ballIsSpecial && playerGesture > 1) {
        isOut = true;
        outReason = `${ballSpecialType === 'yorker' ? 'Yorker' : 'Bouncer'}! Must play 0 or 1`;
        message = `💀 ${ballSpecialType.toUpperCase()}! ${batsman.name} OUT!`;
      }
      // 3. Check match = OUT
      else if (playerGesture === cpuGesture) {
        isOut = true;
        outReason = 'Matched!';
        message = `OUT! ${batsman.name} matched with ${bowler?.name || 'CPU'}! 💥`;
      }
      // 4. Score runs (capped by bowler accuracy)
      else {
        if (playerGesture === 0) {
          runs = Math.min(cpuGesture, bowlerPower.accuracyCap);
          message = `Gamble! ${batsman.name} scored ${runs} 🎰`;
        } else {
          runs = Math.min(playerGesture, bowlerPower.accuracyCap);
          message = `${runs} run${runs > 1 ? 's' : ''}!`;
        }
        totalScore += runs;
        batsman.runs += runs;

        if (runs === 6) message = `SIX! ${batsman.name} 💥🏏`;
        else if (runs === 5) message = `FIVE! ${batsman.name} 🙌`;
        else if (runs === 4) message = `FOUR! ${batsman.name} 🔥`;
      }
    } else if (state === 'BOWLING') {
      // --- Computer is batting, player is bowling ---
      // Bowler power doesn't apply here (player controls bowling via gestures)

      if (playerGesture === cpuGesture) {
        isOut = true;
        outReason = 'Bowled!';
        message = `WICKET! ${batsman.name} caught by you! 🎳`;
      } else {
        runs = cpuGesture;
        totalScore += runs;
        batsman.runs += runs;
        message = `${batsman.name} scored ${cpuGesture}`;

        if (target !== null && totalScore > target) {
          gameOver = true;
          inningsOver = true;
          message = `${battingTeamName} chased it down! 🏆`;
        }
      }
    }

    // Track over
    currentOverBalls.push({ runs, isOut, isIllegal, isSpecialDelivery: ballIsSpecial, bowlerName: bowler?.name || '' });

    if (currentOverBalls.length === 6) {
      overs.push({ over: overs.length + 1, balls: [...currentOverBalls] });
      currentOverBalls = [];
      // Rotate bowler
      currentBowlerIdx++;
    }

    // Handle out
    if (isOut) {
      batsman.isOut = true;
      batsman.outReason = outReason;
      currentBatsmanIdx++;

      if (currentBatsmanIdx >= scorecard.length) {
        inningsOver = true;
        if (!gameOver) message += ' ALL OUT!';
      }
    }

    ballLog.push({
      ball: totalBalls,
      playerGesture,
      cpuGesture,
      runs,
      isOut,
      batsmanName: batsman.name,
      outReason,
      bowlerName: bowler?.name || '',
      isSpecialDelivery: ballIsSpecial,
      specialDeliveryType: ballSpecialType,
    });

    // Handle innings transition
    if (inningsOver && !gameOver) {
      if (innings === 1) {
        if (currentOverBalls.length > 0) {
          overs.push({ over: overs.length + 1, balls: [...currentOverBalls] });
        }
        state = 'INNINGS_BREAK';
        target = totalScore;
        firstInningsScore = totalScore;
        firstInningsScorecard = scorecard.map((s) => ({ ...s }));
      } else {
        gameOver = true;
        state = 'RESULT';
      }
    }

    if (gameOver) {
      if (currentOverBalls.length > 0) {
        overs.push({ over: overs.length + 1, balls: [...currentOverBalls] });
      }
      state = 'RESULT';
    }

    // Roll special delivery for NEXT ball (so UI can show warning)
    if (!isOut && !inningsOver && !gameOver && state === 'BATTING') {
      const nextSpecial = rollSpecialDelivery();
      isSpecialDelivery = nextSpecial.isSpecial;
      specialDeliveryType = nextSpecial.type;
    }

    return {
      cpuGesture, runs, isOut, isIllegal,
      isSpecialDelivery: ballIsSpecial,
      specialDeliveryType: ballSpecialType,
      message, gameOver, inningsOver,
      batsmanName: batsman.name,
      outReason,
      bowlerName: bowler?.name || '',
      accuracyCap: bowlerPower.accuracyCap,
      // Preview for next ball
      nextIsSpecial: isSpecialDelivery,
      nextSpecialType: specialDeliveryType,
    };
  }

  function startSecondInnings() {
    innings = 2;
    if (playerBatsFirst) {
      state = 'BOWLING';
      initInnings(false);
    } else {
      state = 'BATTING';
      initInnings(true);
    }
  }

  function getResult() {
    let secondInningsScore = totalScore;

    let firstBatTeam = playerBatsFirst ? team1.name : team2.name;
    let secondBatTeam = playerBatsFirst ? team2.name : team1.name;

    let winner, message;
    if (secondInningsScore > firstInningsScore) {
      winner = secondBatTeam === team1.name ? 'team1' : 'team2';
      message = `${secondBatTeam} wins! 🏆`;
    } else if (secondInningsScore < firstInningsScore) {
      winner = firstBatTeam === team1.name ? 'team1' : 'team2';
      const diff = firstInningsScore - secondInningsScore;
      message = `${firstBatTeam} wins by ${diff} run${diff > 1 ? 's' : ''}! 🏆`;
    } else {
      winner = 'draw';
      message = "It's a tie! 🤝";
    }

    return {
      winner,
      team1Name: team1.name,
      team2Name: team2.name,
      team1Score: playerBatsFirst ? firstInningsScore : secondInningsScore,
      team2Score: playerBatsFirst ? secondInningsScore : firstInningsScore,
      message,
    };
  }

  function reset() {
    state = 'IDLE';
    innings = 1;
    target = null;
    battingOrder = [];
    bowlingOrder = [];
    currentBatsmanIdx = 0;
    currentBowlerIdx = 0;
    totalScore = 0;
    totalBalls = 0;
    scorecard = [];
    overs = [];
    currentOverBalls = [];
    ballLog = [];
    firstInningsScore = 0;
    firstInningsScorecard = [];
    isSpecialDelivery = false;
    specialDeliveryType = '';
  }

  return {
    setTeams,
    toss,
    playBall,
    startSecondInnings,
    getResult,
    reset,
    getCurrentBatsman,
    getCurrentBowler,
    getCurrentBowlerPower,
    get isSpecialDelivery() { return isSpecialDelivery; },
    get specialDeliveryType() { return specialDeliveryType; },
    get state() { return state; },
    get totalScore() { return totalScore; },
    get totalBalls() { return totalBalls; },
    get innings() { return innings; },
    get target() { return target; },
    get scorecard() { return scorecard; },
    get overs() { return overs; },
    get currentOverBalls() { return currentOverBalls; },
    get ballLog() { return ballLog; },
    get battingTeamName() { return battingTeamName; },
    get bowlingTeamName() { return bowlingTeamName; },
    get playerBatsFirst() { return playerBatsFirst; },
    get team1() { return team1; },
    get team2() { return team2; },
    get firstInningsScorecard() { return firstInningsScorecard; },
  };
}
