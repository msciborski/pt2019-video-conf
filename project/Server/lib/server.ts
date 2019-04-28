import app from "./app";
import * as socketio from "socket.io";
import { createServer } from "https";
import { readFileSync } from "fs";

const PORT = 5000;
const server = createServer({
  key: readFileSync('/etc/letsencrypt/live/nodeference.com/privkey.pem'),
  cert: readFileSync('/etc/letsencrypt/live/nodeference.com/cert.pem'),
  ca: readFileSync('/etc/letsencrypt/live/nodeference.com/chain.pem'),
  requestCert: false,
  rejectUnauthorized: false,
}, app);
let io = require("socket.io")(server);

server.listen(PORT, () => {
  console.log(`Express is listening on ${PORT}`);
});

io.listen(server, { log: true })
  .on('connection', (socket) => {
    console.log('connected')

    io.emit('peer', { peerId: socket.id });

    socket.on('disconect', reason => {
      io.emit('unpeer', {
        peerId: socket.id,
        reason
      });
    })

    socket.on('signal', msg => {
      const recId = msg.to;
      const receiver = io.sockets.connected[recId];

      if (receiver) {
        const data = {
          from: socket.id,
          ...msg,
        }

        io.to(recId).emit('signal', data);
      }
    })
  });


