"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const http_1 = require("http");
const PORT = 3000;
const server = http_1.createServer(app_1.default);
let io = require("socket.io")(server);
server.listen(PORT, () => {
    console.log(`Express is listening on ${PORT}`);
});
io.listen(server, { log: true })
    .on('connection', (socket) => {
    console.log('connected');
    io.emit('peer', { peerId: socket.id });
    socket.on('disconect', reason => {
        io.emit('unpeer', {
            peerId: socket.id,
            reason
        });
    });
    socket.on('signal', msg => {
        const recId = msg.to;
        const receiver = io.sockets.connected[recId];
        if (receiver) {
            const data = Object.assign({ from: socket.id }, msg);
            io.to(recId).emit('signal', data);
        }
    });
});
//# sourceMappingURL=server.js.map