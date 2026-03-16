/**
 * handDetector.js
 * Initializes MediaPipe HandLandmarker and provides finger counting (0–6).
 */

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/** @type {HandLandmarker|null} */
let handLandmarker = null;

// MediaPipe landmark indices
const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

/**
 * Initialize the MediaPipe HandLandmarker model.
 * @returns {Promise<void>}
 */
export async function initHandDetector() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });
}

/**
 * Detect hand landmarks from a video frame.
 * @param {HTMLVideoElement} video
 * @returns {import('@mediapipe/tasks-vision').HandLandmarkerResult|null}
 */
export function detectHands(video) {
  if (!handLandmarker) return null;
  return handLandmarker.detectForVideo(video, performance.now());
}

/**
 * Count fingers from landmarks array.
 * Mapping:
 *  0 = closed fist (no fingers, thumb tucked)
 *  1 = index only
 *  2 = index + middle
 *  3 = index + middle + ring
 *  4 = index + middle + ring + pinky (thumb tucked)
 *  5 = all five digits extended (open palm)
 *  6 = only thumb extended (closed fist + thumb out)
 *
 * @param {Array<{x: number, y: number, z: number}>} lm - 21 landmarks
 * @returns {number} 0–6
 */
export function countFingers(lm) {
  if (!lm || lm.length < 21) return -1;

  // Determine handedness by checking if thumb is to the left or right of the wrist
  const isRightHand = lm[THUMB_CMC].x < lm[PINKY_PIP].x;

  // Thumb: compare tip x vs IP joint x (direction depends on hand)
  const thumbExtended = isRightHand
    ? lm[THUMB_TIP].x < lm[THUMB_IP].x
    : lm[THUMB_TIP].x > lm[THUMB_IP].x;

  // For the four fingers: tip y < pip y means extended (y goes down in normalized coords)
  const indexExtended = lm[INDEX_TIP].y < lm[INDEX_PIP].y;
  const middleExtended = lm[MIDDLE_TIP].y < lm[MIDDLE_PIP].y;
  const ringExtended = lm[RING_TIP].y < lm[RING_PIP].y;
  const pinkyExtended = lm[PINKY_TIP].y < lm[PINKY_PIP].y;

  const fingerStates = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended];
  const extendedCount = fingerStates.filter(Boolean).length;

  // --- Gesture classification ---

  // 6: Only thumb extended (closed fist + thumb out)
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 6;
  }

  // 5: All five digits extended (open palm)
  if (extendedCount === 5) {
    return 5;
  }

  // 4: Index + Middle + Ring + Pinky (no thumb)
  if (!thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 4;
  }

  // 3: Index + Middle + Ring
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    return 3;
  }

  // 2: Index + Middle
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 2;
  }

  // 1: Index only
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 1;
  }

  // 0: Closed fist (nothing extended)
  if (extendedCount === 0) {
    return 0;
  }

  // Fallback: use total extended count
  return Math.min(extendedCount, 5);
}

/**
 * Draw landmarks on the canvas overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number, z: number}>} landmarks
 * @param {number} width
 * @param {number} height
 */
export function drawLandmarks(ctx, landmarks, width, height) {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks || landmarks.length === 0) return;

  // Draw connections
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [0, 9], [9, 10], [10, 11], [11, 12],   // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17],             // Palm
  ];

  ctx.strokeStyle = 'rgba(0, 230, 118, 0.6)';
  ctx.lineWidth = 2;
  for (const [a, b] of connections) {
    ctx.beginPath();
    ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
    ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
    ctx.stroke();
  }

  // Draw points
  ctx.fillStyle = '#00e676';
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}
