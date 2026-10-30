const socket = require("socket.io");
const { Chat } = require("../models/Chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://code-circle-frontend-flame.vercel.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("joinChat", ({ userId, targetUserID }) => {
      const roomId = [userId, targetUserID].sort().join("_");

      socket.join(roomId);

      console.log("JOIN CHAT:", userId, targetUserID);
      console.log("ROOM ID:", roomId);
    });

    socket.on(
      "sendMessage",
      async ({ userId, targetUserID, text }) => {
        try {
          const roomId = [userId, targetUserID].sort().join("_");

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserID] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserID],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          io.to(roomId).emit("receiveMessage", {
            senderId: userId,
            text,
          });

          console.log("Message saved:", text);
        } catch (err) {
          console.error("Send Message Error:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;