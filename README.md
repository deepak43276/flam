powershell
New-Item -Path "README.md" -ItemType File
README.md (Complete content - copy this):

text
# Collaborative Drawing Canvas 🖌️

Real-time multi-user drawing app using **raw HTML Canvas API** + **Socket.io**. No external drawing libraries.



## 🚀 Quick Start

```bash
# Clone & Install
git clone <your-repo-url>
cd collaborative-canvas
npm install

# Run locally
npm start
Open http://localhost:3000 in multiple tabs to test!

✨ Features Implemented
✅ Real-time drawing sync - See others draw live
✅ Live user cursors - Track other users' positions
✅ Global Undo/Redo - Anyone can undo anyone's strokes
✅ Brush + Eraser - Multiple colors & sizes
✅ Mobile touch support
✅ Conflict handling - Last draw wins
✅ Room system - Separate drawing spaces
✅ High DPI retina - Crisp drawing on all screens

🧪 Testing Multi-User
Open 3 browser tabs/windows

Enter same Room ID (default works)

Click "Join Room" in each tab

Draw simultaneously - watch live cursors & strokes!

Test Undo - works globally across all users

Try Eraser - erases all strokes

text
User1 draws → User2 sees immediately → User1 undoes → User2 canvas updates
📁 Folder Structure
text
collaborative-canvas/
├── client/           # Frontend (HTML5 Canvas + JS)
│   ├── index.html
│   ├── style.css
│   ├── canvas.js     # Raw Canvas API logic
│   ├── websocket.js  # Socket.io client
│   └── main.js       # App initialization
├── server/           # Node.js + Socket.io
│   ├── server.js     # Express + WebSocket server
│   ├── rooms.js      # Room management
│   └── drawing-state.js
├── package.json
├── README.md
├── ARCHITECTURE.md   # System design
└── .gitignore