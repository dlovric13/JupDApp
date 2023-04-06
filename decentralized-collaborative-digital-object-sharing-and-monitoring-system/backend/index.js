const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { JWT_SECRET } = require("./util/config");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;



// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8080", "http://localhost:8888"], 
  })
);

app.use((req, res, next) => {
    console.log("Request URL:", req.url);
  console.log("Request token:", req.cookies.token);
  next();
});

// app.use((req, res, next) => {
//   console.log("Request headers:", req.headers);
//   next();
// });


app.set("secret", JWT_SECRET);
app.use(jwtMiddleware);


const notebookRoutes = require("./routes/notebookRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/notebook", notebookRoutes);
app.use("/auth", authRoutes);
app.use("/api", authRoutes);
app.listen(port, () => console.log(`Server started on port ${port}`));
