/**
 * multiplayer.js
 * Handles Socket.io connection and events.
 */

import { io } from 'socket.io-client';

let socket = null;
export let isMultiplayer = false;
export let isPlayer1 = false; // Player 1 bats first
export let roomCode = null;

// Callbacks
let onRoomCreatedCb = null;
let onRoomJoinedCb = null;
let onErrorCb = null;
let onMatchReadyCb = null;
let onStartTossCb = null;
let onBallResultCb = null;
let onOpponentLeftCb = null;

export function initMultiplayer(options) {
  onRoomCreatedCb = options.onRoomCreated;
  onRoomJoinedCb = options.onRoomJoined;
  onErrorCb = options.onError;
  onMatchReadyCb = options.onMatchReady;
  onStartTossCb = options.onStartToss;
  onBallResultCb = options.onBallResult;
  onOpponentLeftCb = options.onOpponentLeft;

  // Dynamically resolve the hostname so local network multiplayer works
  const host = window.location.hostname;
  socket = io(`http://${host}:3001`);

  socket.on('connect', () => {
    console.log('Connected to MP server', socket.id);
  });

  socket.on('error_msg', (msg) => {
    if (onErrorCb) onErrorCb(msg);
  });

  socket.on('room_created', (data) => {
    isMultiplayer = true;
    roomCode = data.roomCode;
    isPlayer1 = data.isPlayer1;
    if (onRoomCreatedCb) onRoomCreatedCb(roomCode);
  });

  socket.on('room_joined', (data) => {
    isMultiplayer = true;
    roomCode = data.roomCode;
    isPlayer1 = data.isPlayer1;
    if (onRoomJoinedCb) onRoomJoinedCb(roomCode);
  });

  socket.on('match_ready', (msg) => {
    if (onMatchReadyCb) onMatchReadyCb(msg);
  });

  socket.on('start_toss', (data) => {
    if (onStartTossCb) onStartTossCb(data);
  });

  socket.on('ball_result', (data) => {
    if (onBallResultCb) onBallResultCb(data);
  });

  socket.on('opponent_left', (msg) => {
    isMultiplayer = false;
    roomCode = null;
    if (onOpponentLeftCb) onOpponentLeftCb(msg);
  });
}

export function createRoom() {
  if (socket) socket.emit('create_room');
}

export function joinRoom(code) {
  if (socket) socket.emit('join_room', code);
}

export function notifyTeamsReady(team) {
  if (socket && roomCode) socket.emit('teams_ready', { roomCode, team });
}

export function sendPlayBall(gesture) {
  if (socket && roomCode) socket.emit('play_ball', { roomCode, gesture });
}
