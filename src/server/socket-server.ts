import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production!
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("new-notification", (notification) => {
    // Broadcast to all connected clients (admins)
    io.emit("admin-notification", notification);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 3008;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});