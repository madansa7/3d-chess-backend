const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

app.use(cors());
const io = new Server(http, { cors: { origin: '*' } });

const chess = new Chess();

io.on('connection', (socket) => {
    console.log('user connected:', socket.id);
    socket.emit('init', chess.fen());

    socket.on('move', (move) => {
        let result = chess.move(move);
        if (result) {
            io.emit('move', move);
        } else {
            socket.emit('invalid_move', move);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        chess.reset();
        io.emit('reset', chess.fen());
    });
});

http.listen(process.env.PORT || 4000, () => {
    console.log('Server running');
});
