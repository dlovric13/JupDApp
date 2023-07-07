const express = require("express");
const router = express.Router();

const config = require("../util/config");
const jwt = require("jsonwebtoken");


router.get("/get-token", async (req, res) => {
  console.log("GET /get-token request received");
  const fixedKey = "fixedTokenKey";
  const redisClient = req.app.get("redisClient");

  redisClient
    .get(fixedKey, (err, token) => {
      if (err) {
        console.error("Error getting token from Redis:", err);
        res.status(500).send("Error getting token");
      } else if (token) {
        res.send({ token });
        console.log("Token from the /get-token route", token);
      } else {
        res.status(404).send({ message: "Token not found in Redis" });
      }
    })
    .catch((err) => {
      console.error("Error in /get-token route:", err);
      res.status(500).send("Error getting token");
    });
});

router.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    organization: { value: organization },
    userType: { value: userType },
    affiliation,
  } = req.body;

  try {
    if (!username || !email || !password || !organization) {
      res.status(400).send("Invalid input");
      return;
    }

    const registerEnrollUserScript = require("../registerEnrollUser.js");
    await registerEnrollUserScript.main(
      organization,
      username,
      email,
      password,
      userType,
      config.adminId,
      affiliation
    );

    res.status(200).send({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const loginUserScript = require("../loginUser.js");
    const token = await loginUserScript.loginUser(username, password);

    if (token) {
      const redisClient = req.app.get("redisClient");
      const fixedKey = "fixedTokenKey";

     await redisClient.set(fixedKey, token, "EX", 60 * 60);


      console.log("Redis token:", fixedKey, token);
      res.status(200).send({ token });
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Error logging in user");
    next(error);
  }
});

router.use((error, req, res, next) => {
  console.error("Error in /login route:", error);
  res.status(500).send({ message: "Error logging in user", error });
});

module.exports = router;
