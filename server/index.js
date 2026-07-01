const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.send('Task Manager API is running!');
});

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`User joined board: ${boardId}`);
  });

  socket.on('cardCreated', (data) => {
    socket.to(data.boardId).emit('cardCreated', data);
  });

  socket.on('cardUpdated', (data) => {
    socket.to(data.boardId).emit('cardUpdated', data);
  });

  socket.on('cardDeleted', (data) => {
    socket.to(data.boardId).emit('cardDeleted', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});