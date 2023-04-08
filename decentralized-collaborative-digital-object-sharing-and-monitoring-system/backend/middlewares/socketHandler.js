const WebSocket = require("ws");

// function onNewNotebookShared(wss) {
//   // Emit the newNotebookShared event to all connected clients
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send("newNotebookShared");
//     }
//   });
// }

function onNewNotebookShared(wss) {
  // Emit the newNotebookShared event to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "newNotebookShared" }));
    }
  });
}


function initWebSocket(server) {
const wss = new WebSocket.Server({ server, path: "/ws" });


  wss.on("connection", (socket) => {
    console.log("Client connected");

    // Handle the 'token' message from the client
    socket.on("token", (message) => {
      console.log("Token received:", message);
      // You can add your own logic here to validate the token, etc.
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
};
