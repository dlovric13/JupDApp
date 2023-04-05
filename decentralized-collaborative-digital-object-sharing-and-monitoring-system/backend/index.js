const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { JWT_SECRET } = require("./util/config");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const app = express();
const port = 3000;



// Middleware
app.use(bodyParser.json());
app.use(cors());

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

app.listen(port, () => console.log(`Server started on port ${port}`));
