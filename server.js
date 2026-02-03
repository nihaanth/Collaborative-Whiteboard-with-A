import {createServer} from 'http';
import {Server} from 'socket.io';


const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('draw', (data) => {
    // Broadcast the drawing data to all other clients
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });


});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});
