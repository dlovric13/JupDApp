const express = require("express");
const router = express.Router();
const { onNewNotebookShared } = require("../middlewares/socketHandler");
const { redisClient } = require("../redisSetup");

// Import the Hyperledger Fabric SDK and create a new Gateway instance
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const ccpPath = path.resolve(
  __dirname,
  "..",
  "..",
  "fabric-samples",
  "test-network",
  "organizations",
  "peerOrganizations",
  "org1.example.com",
  "connection-org1.json"
);

const gatewayTimeout = 5000;

const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

async function requestAccess(req, res) {
  const { notebookId, username } = req.body;
  const { userType, affiliation, userID } = req.user;
  const timestamp = new Date().toISOString();
  try {
    console.log("Request body:", req.body);
    console.log("User type:", userType);
    console.log("Affiliation:", affiliation);
    console.log("Timestamp:", timestamp);
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    await contract.submitTransaction(
      "AccessContract:requestAccess",
      notebookId,
      username,
      userID,
      userType,
      affiliation,
      timestamp
    );
    console.log(
      `Access request sent for notebook ID ${notebookId} by user ID ${username}`
    );
    res.status(201).json({ message: "Access request sent" });

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to request access: ${error}`);
    res.status(500).send("Failed to request access");
  }
}

async function manageAccess(req, res) {
  const notebookId = req.params.id;
  const userId = req.params.userId;
  const action = req.params.action;

  try {
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    await contract.submitTransaction(
      "AccessContract:manageAccess",
      notebookId,
      userId,
      action
    );
    console.log(
      `Access request for notebook ID ${notebookId} and user ID ${userId} was ${action}`
    );
    res.status(200).json({ message: "Access request managed" });

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to manage access: ${error}`);
    res.status(500).send("Failed to manage access");
  }
}

async function getRequests(req, res) {
  try {
    const adminId = req.user.userID;
    console.log("Admin id:", adminId);

    // Add these lines to set up the wallet and check for the admin user
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    const requests = await contract.evaluateTransaction(
      "AccessContract:getRequests",
      adminId
    );
    res.status(200).json(JSON.parse(requests.toString()));

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to get requests: ${error}`);
    res.status(500).send("Failed to get requests");
  }
}

async function getApprovedUsers(req, res) {
  const adminId = req.user.userID;
  console.log("Admin id:", adminId);

  try {
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    const approvedUsers = await contract.evaluateTransaction(
      "AccessContract:getApprovedUsers",
      adminId
    );
    res.status(200).json(JSON.parse(approvedUsers.toString()));

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to get approved users: ${error.message}`);
    res.status(500).send(`Failed to get approved users: ${error.message}`);
  }
}

async function removeAccess(req, res) {
  const notebookId = req.params.id;
  const userId = req.params.userId;

  try {
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    await contract.submitTransaction(
      "AccessContract:removeAccess",
      notebookId,
      userId
    );
    console.log(
      `Access for notebook ID ${notebookId} and user ID ${userId} was removed`
    );
    res.status(200).json({ message: "Access removed" });

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to remove access: ${error}`);
    res.status(500).send("Failed to remove access");
  }
}


async function toggleEditAccess(req, res) {
  const notebookId = req.params.id;
  const userId = req.params.userId;

  try {
    const walletPath = path.join(__dirname, "..", "wallet", "org1");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.get("admin");
    if (!userExists) {
      console.log(
        'An identity for the user "user1" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
      timeout: gatewayTimeout,
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    const result = await contract.submitTransaction(
      "AccessContract:toggleEditAccess",
      notebookId,
      userId
    );

      const hasEditAccess = JSON.parse(result).hasEditAccess;

      // Update the edit access in Redis
      await redisClient.set(
        `${notebookId}_${userId}_hasEditAccess`,
        hasEditAccess
      );
      console.log("Set edit access", hasEditAccess); 
    console.log(
      `Edit access for notebook ID ${notebookId} and user ID ${userId} was toggled`
    );
    res.status(200).json({ hasEditAccess: JSON.parse(result).hasEditAccess });

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to toggle edit access: ${error}`);
    res.status(500).send("Failed to toggle edit access");
  }
}


router.get("/get-edit-access/:notebookId/:userId", async (req, res) => {
  const { notebookId, userId } = req.params;
  console.log("Notebook id and user id", notebookId, userId);
  const hasEditAccess = await redisClient.get(
    `${notebookId}_${userId}_hasEditAccess`
  );
  
  console.log("Edit access:", hasEditAccess);
  console.log(`${notebookId}_${userId}_hasEditAccess`);
  if (hasEditAccess !== null) {
    res.json({ hasEditAccess: hasEditAccess === "true" });
  } else {
    res
      .status(404)
      .json({ message: "Edit access not found for the user and notebook" });
  }
});

router.post("/request-access", requestAccess);
router.post("/:id/manage-access/:userId/:action", manageAccess);
router.post("/:id/remove-access/:userId", removeAccess);
router.post("/:id/toggle-edit-access/:userId", toggleEditAccess);
router.get("/requests", getRequests);
router.get("/approved-users", getApprovedUsers);

module.exports = router;

