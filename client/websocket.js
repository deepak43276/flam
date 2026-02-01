const socket = io();

let myColor = '#000000';
let users = [];

socket.on('init', (data) => {
  canvasDrawer.loadHistory(data.drawingHistory);
  users = data.users;
  updateUserCount();
});

socket.on('drawing', (data) => {
  canvasDrawer.applyRemoteDrawing(data.path, data.isEraser);
});

socket.on('cursor-move', (data) => {
  updateCursor(data.userId, data.x, data.y, data.color);
});

socket.on('user-joined', (user) => {
  users.push(user);
  updateUserCount();
});

socket.on('user-left', (userId) => {
  users = users.filter(u => u.id !== userId);
  removeCursor(userId);
  updateUserCount();
});

socket.on('undo-applied', (history) => {
  canvasDrawer.loadHistory(history);
});

function joinRoom(roomId, username) {
  socket.emit('join-room', { roomId, username });
}

function sendDrawing(path, isEraser) {
  socket.emit('drawing', { path, isEraser });
}

function sendCursorMove(x, y) {
  socket.emit('cursor-move', { x, y });
}

function sendUndo() {
  socket.emit('undo');
}

function updateCursor(userId, x, y, color) {
  canvasDrawer.showCursor(userId, x, y, color);
}

function removeCursor(userId) {
  const cursor = document.getElementById(`cursor-${userId}`);
  if (cursor) cursor.remove();
}


function updateUserCount() {
  document.getElementById('userCount').textContent = `${users.length} users online`;
}
