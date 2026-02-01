class CanvasDrawer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;
    
    this.isDrawing = false;
    this.currentPath = [];
    this.drawingHistory = [];
    this.redoStack = [];
    
    this.brushSize = 5;
    this.color = '#000000';
    this.isEraser = false;
    
    this.initEventListeners();
    this.setupCanvas();
  }

  initEventListeners() {
    const canvas = this.canvas;
    
    ['mousedown', 'mousemove', 'mouseup', 'mouseout'].forEach(event => {
      canvas.addEventListener(event, (e) => this.handleMouseEvent(e));
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => this.handleTouchEvent(e));
    canvas.addEventListener('touchmove', (e) => this.handleTouchEvent(e));
    canvas.addEventListener('touchend', (e) => this.handleTouchEvent(e));
  }

  handleMouseEvent(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.type === 'mousedown') {
      this.startDrawing(x, y);
    } else if (e.type === 'mousemove' && this.isDrawing) {
      this.draw(x, y);
    } else if (e.type === 'mouseup' || e.type === 'mouseout') {
      this.stopDrawing();
    }
  }

  handleTouchEvent(e) {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (e.type === 'touchstart') {
      this.startDrawing(x, y);
    } else if (e.type === 'touchmove') {
      this.draw(x, y);
    } else if (e.type === 'touchend') {
      this.stopDrawing();
    }
  }

  startDrawing(x, y) {
    this.isDrawing = true;
    this.currentPath = [{ x, y, pressure: 1 }];
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.brushSize;
    
    this.draw(x, y);
  }

  draw(x, y) {
    if (!this.isDrawing) return;
    
    this.currentPath.push({ x, y, pressure: 1 });
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
    
    for (let i = 1; i < this.currentPath.length; i++) {
      this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
    }
    
    this.ctx.stroke();
    
    // Send to server every 50ms max
    if (this.sendTimer) clearTimeout(this.sendTimer);
    this.sendTimer = setTimeout(() => {
      websocket.sendDrawing(this.currentPath, this.isEraser);
    }, 50);
  }

  stopDrawing() {
    if (this.isDrawing && this.currentPath.length > 1) {
      this.drawingHistory.push({ path: [...this.currentPath], isEraser: this.isEraser });
      this.redoStack = [];
    }
    this.isDrawing = false;
    this.currentPath = [];
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  setColor(color) {
    this.color = color;
    this.isEraser = false;
  }

  setEraser() {
    this.isEraser = true;
    this.color = '#FFFFFF';
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingHistory = [];
    this.redoStack = [];
  }

  undo() {
    if (this.drawingHistory.length > 0) {
      this.redoStack.push(this.drawingHistory.pop());
      this.redraw();
    }
  }

  applyRemoteDrawing(path, isEraser) {
    if (path.length < 2) return;
    
    const ctx = this.ctx;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }

  showCursor(userId, x, y, color) {
  let cursor = document.getElementById(`cursor-${userId}`);
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.id = `cursor-${userId}`;
    document.getElementById('cursors').appendChild(cursor);
  }
  cursor.style.left = x + 'px';
  cursor.style.top = y + 'px';
  cursor.style.backgroundColor = color;
}

  loadHistory(history) {
    this.clearCanvas();
    this.drawingHistory = history;
    this.redraw();
  }

  redraw() {
    this.clearCanvas();
    this.drawingHistory.forEach(stroke => {
      this.applyRemoteDrawing(stroke.path, stroke.isEraser);
    });
  }

  setupCanvas() {
    // Enable high DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }
}
