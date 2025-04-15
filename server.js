const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

const games = {};

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('joinGame', (roomId) => {
    socket.join(roomId);
    if (!games[roomId]) {
      games[roomId] = new Chess();
    }
    io.to(roomId).emit('gameState', games[roomId].fen());
  });

  socket.on('makeMove', ({ roomId, move }) => {
    const game = games[roomId];
    if (game && game.move(move)) {
      io.to(roomId).emit('gameState', game.fen());
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

