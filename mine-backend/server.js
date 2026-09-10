const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {origin: "*"} 
});
io.on('connection', (socket) => {
    console.log('Frontend connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Frontend disconnected:', socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
