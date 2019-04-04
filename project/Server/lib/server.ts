import app from "./app";
import * as socketio from "socket.io";
import { createServer } from "http";

const PORT = 3000;
const server = createServer(app);
let io = require("socket.io")(server);

server.listen(PORT, () => {
  console.log(`Express is listening on ${PORT}`);
});

io.listen(server, { log: true })
  .on('connection', () => console.log('user connected'));


