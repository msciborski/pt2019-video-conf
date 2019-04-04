"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const http_1 = require("http");
const PORT = 3000;
const server = http_1.createServer(app_1.default);
let io = require("socket.io")(server);
console.log('IO:', io);
console.log('Server:', server);
server.listen(PORT, () => {
    console.log(`Express is listening on ${PORT}`);
});
io.listen(server, { log: true })
    .on('connection', () => console.log('user connected'));
//# sourceMappingURL=server.js.map