const express = require("express");
const router = express.Router();

let vueLastPingTime = null;

const vuePingMiddleware = (req, res, next) => {
  // Update the last ping time whenever a request is made to the VueJS app
  vueLastPingTime = Date.now();
  console.log("Ping request received from the Vue app:", vueLastPingTime);
  next();
};

router.get("/server-status", (req, res) => {
  res.status(200).json({ status: "running" });
});

router.get("/vue-ping", vuePingMiddleware, (req, res) => {
  res.status(200).json({ status: "success" });
});

router.get("/vue-status", (req, res) => {
  const ONE_MINUTE = 1 * 60 * 1000;
  if (vueLastPingTime && Date.now() - vueLastPingTime < ONE_MINUTE) {
    res.status(200).json({ status: "running" });
  } else {
    res.status(500).json({ status: "not running" });
  }
});


module.exports = router;