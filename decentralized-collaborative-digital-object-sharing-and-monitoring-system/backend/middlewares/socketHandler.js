const WebSocket = require("ws");

function onNewNotebookShared(wss) {
  // Emit the newNotebookShared event to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "newNotebookShared" }));
    }
  });
}


function onAccessRemoved(wss, data) {
  // Emit the accessRemoved event to all connected clients with the notebookId and userId
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "accessRemoved", data }));
    }
  });
}

function initWebSocket(server) {
global.wss = new WebSocket.Server({ server, path: "/ws" });


  wss.on("connection", (socket) => {
    console.log("Client connected");

    // Handle the 'token' message from the client
    socket.on("token", (message) => {
      console.log("Token received:", message);
    });

    // Handle the 'disconnect' event
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}

module.exports = {
  initWebSocket,
  onNewNotebookShared,
  onAccessRemoved,
};
