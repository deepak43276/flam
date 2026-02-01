const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

const rooms = new Map(); // roomId -> { users: [], drawingHistory: [] }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [], drawingHistory: [] });
    }
    
    const room = rooms.get(roomId);
    room.users.push({ id: socket.id, username, color: getRandomColor() });
    
    // Send room state to new user
    socket.emit('init', {
      drawingHistory: room.drawingHistory,
      users: room.users
    });
    
    // Broadcast new user to others
    socket.to(roomId).emit('user-joined', { id: socket.id, username, color: room.users.find(u => u.id === socket.id).color });
    
    socket.roomId = roomId;
  });

  socket.on('drawing', (data) => {
    socket.to(socket.roomId).emit('drawing', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(socket.roomId).emit('cursor-move', { ...data, userId: socket.id });
  });

  socket.on('undo', () => {
    const room = rooms.get(socket.roomId);
    if (room.drawingHistory.length > 0) {
      room.drawingHistory.pop();
      io.to(socket.roomId).emit('undo-applied', room.drawingHistory);
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      room.users = room.users.filter(u => u.id !== socket.id);
      socket.to(socket.roomId).emit('user-left', socket.id);
    }
  });
});

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#F0932B', '#EB4D4B', '#6C5CE7', '#A29BFE'];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
