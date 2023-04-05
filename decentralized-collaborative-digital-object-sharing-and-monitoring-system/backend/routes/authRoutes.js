const express = require("express");
const router = express.Router();

const config = require("../util/config");


router.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    organization: { value: organization },
    userType: { value: userType },
    affiliation,
  } = req.body;

  console.log(req.body);
  console.log("tu1" + organization);
  console.log("tu2" + userType);
  console.log("tu3" + affiliation);
  try {
    // You can add more validation logic here if needed
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
    const token = await loginUserScript.loginUser(
      username,
      password
    );

    if (token) {
      res.status(200).send({ token });
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Error logging in user");
  }
});

module.exports = router;