const canvasDrawer = new CanvasDrawer(document.getElementById('canvas'));
let isConnected = false;

document.addEventListener('DOMContentLoaded', () => {
  setupToolbar();
  setupResizeHandler();
});

function setupToolbar() {
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const brushBtn = document.getElementById('brushBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const undoBtn = document.getElementById('undoBtn');
  const joinBtn = document.getElementById('joinBtn');

  // Tool controls
  colorPicker.addEventListener('change', (e) => {
    canvasDrawer.setColor(e.target.value);
  });

  brushSize.addEventListener('input', (e) => {
    canvasDrawer.setBrushSize(parseInt(e.target.value));
    document.querySelector('.brush-size-value').textContent = e.target.value;
  });

  brushBtn.addEventListener('click', () => {
    canvasDrawer.setEraser(false);
    setActiveTool(brushBtn);
  });

  eraserBtn.addEventListener('click', () => {
    canvasDrawer.setEraser();
    setActiveTool(eraserBtn);
  });

  clearBtn.addEventListener('click', () => {
    canvasDrawer.clearCanvas();
  });

  undoBtn.addEventListener('click', () => {
    canvasDrawer.undo();
    websocket.sendUndo();
  });

  joinBtn.addEventListener('click', () => {
    const roomId = document.getElementById('roomId').value || 'default';
    const username = `User${Math.floor(Math.random() * 1000)}`;
    joinRoom(roomId, username);
    isConnected = true;
  });

  // Send cursor position
  document.addEventListener('mousemove', (e) => {
    if (isConnected) {
      const rect = canvasDrawer.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendCursorMove(x, y);
    }
  });
}

function setActiveTool(activeBtn) {
  document.querySelectorAll('.toolbar button').forEach(btn => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

function setupResizeHandler() {
  window.addEventListener('resize', () => {
    canvasDrawer.setupCanvas();
  });
}
