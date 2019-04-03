import app from "./app";
import { createServer } from "http";

const PORT = 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Express is listening on ${PORT}`);
});

