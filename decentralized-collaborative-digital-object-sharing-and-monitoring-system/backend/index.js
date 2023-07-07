const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { JWT_SECRET } = require("./util/config");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const cookieParser = require("cookie-parser");
const http = require("http");
const { initWebSocket } = require("./middlewares/socketHandler");
const app = express();
const { redisClient} = require("./redisSetup");
const server = http.createServer(app);
const io = initWebSocket(server);
app.set("wss", io);

const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8080", "http://127.0.0.1:8888"],
  })
);

app.set("redisClient", redisClient);
app.set("secret", JWT_SECRET);
app.use(jwtMiddleware);

const notebookRoutes = require("./routes/notebookRoutes")(io); 
const authRoutes = require("./routes/authRoutes");
const accessRoutes = require("./routes/accessRoutes");

app.use("/notebook", notebookRoutes);
app.use("/auth", authRoutes);
app.use("/access", accessRoutes);
app.use("/api", authRoutes);


// Replace this line:
// app.listen(port, () => console.log(`Server started on port ${port}`));

// With this line:
function startServer() {
  server.listen(port, () => console.log(`Server started on port ${port}`));
}
startServer();
