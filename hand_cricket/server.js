import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Room storage
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. Create Room
  socket.on('create_room', () => {
    // Generate a 4 digit code
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    rooms[roomCode] = {
      p1: socket.id,
      p2: null,
      state: 'waiting', // waiting, team_selection, playing
      p1Ready: false,
      p2Ready: false,
      teams: { p1: null, p2: null }, // Team objects
      turn: { p1Gesture: null, p2Gesture: null }
    };
    socket.join(roomCode);
    socket.emit('room_created', { roomCode, isPlayer1: true });
    console.log(`Room ${roomCode} created by ${socket.id}`);
  });

  // 2. Join Room
  socket.on('join_room', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error_msg', 'Room not found!');
      return;
    }
    if (room.p2) {
      socket.emit('error_msg', 'Room is full!');
      return;
    }
    room.p2 = socket.id;
    socket.join(roomCode);
    socket.emit('room_joined', { roomCode, isPlayer1: false });
    
    // Notify both players
    io.to(roomCode).emit('match_ready', 'Player 2 has joined. Please select your teams.');
    room.state = 'team_selection';
    console.log(`${socket.id} joined room ${roomCode}`);
  });

  // 3. Teams Ready (from team builder screen)
  socket.on('teams_ready', ({ roomCode, team }) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    if (socket.id === room.p1) {
      room.teams.p1 = team;
      room.p1Ready = true;
    } else if (socket.id === room.p2) {
      room.teams.p2 = team;
      room.p2Ready = true;
    }

    if (room.p1Ready && room.p2Ready) {
      // Both ready, start Toss
      room.state = 'playing';
      io.to(roomCode).emit('start_toss', {
        p1Team: room.teams.p1,
        p2Team: room.teams.p2
      });
    }
  });

  // 4. Play Ball
  socket.on('play_ball', ({ roomCode, gesture }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (socket.id === room.p1) room.turn.p1Gesture = gesture;
    if (socket.id === room.p2) room.turn.p2Gesture = gesture;

    // Wait until both played
    if (room.turn.p1Gesture !== null && room.turn.p2Gesture !== null) {
      io.to(roomCode).emit('ball_result', {
        p1Gesture: room.turn.p1Gesture,
        p2Gesture: room.turn.p2Gesture
      });
      // Reset turn
      room.turn.p1Gesture = null;
      room.turn.p2Gesture = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Find room and notify the other player
    for (const [code, room] of Object.entries(rooms)) {
      if (room.p1 === socket.id || room.p2 === socket.id) {
        io.to(code).emit('opponent_left', 'Your opponent disconnected.');
        delete rooms[code];
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Hand Cricket WebSocket Server listening on port ${PORT}`);
});
