const express = require("express");
const router = express.Router();
const { onNewNotebookShared } = require("../middlewares/socketHandler");

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

async function storeNotebook(req, res, io) {
  const notebook = req.body;
  console.log("tu1");
  console.log(req.body);
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

    console.log("tu");
    console.log(contract);
    await contract.submitTransaction(
      "NotebookContract:storeNotebook",
      JSON.stringify(notebook)
    );
    console.log(`Notebook stored: ${notebook}`);
    res.status(201).json({ message: "Notebook created" });
    
    onNewNotebookShared(io);

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    res.status(500).json({ message: "Notebook not created" });
  }
}

async function getAllNotebooks(req, res) {
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

    const notebooks = await contract.evaluateTransaction(
      "NotebookContract:getAllNotebooks"
    );
    console.log(`All Notebooks: ${notebooks}`);
    res.status(200).json(JSON.parse(notebooks.toString()));

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to get all notebooks: ${error}`);
    res.status(500).send("Failed to get all notebooks");
  }
}

async function getNotebookById(req, res) {
  const notebookId = req.params.id;
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

    const notebook = await contract.evaluateTransaction(
      "NotebookContract:getNotebook",
      notebookId
    );
    console.log(`Notebook with ID ${notebookId}: ${notebook}`);
    res.status(200).json(JSON.parse(notebook.toString()));

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to get notebook with ID ${notebookId}: ${error}`);
    res.status(500).send(`Failed to get notebook with ID ${notebookId}`);
  }
}


async function getNotebookHistory(req, res) {
  const notebookId = req.params.id;
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

    const history = await contract.evaluateTransaction(
      "NotebookContract:getNotebookHistory",
      notebookId
    );
    console.log(`History of notebook ${notebookId}: ${history}`);
    res.status(200).json(JSON.parse(history.toString()));

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to get history of notebook ${notebookId}: ${error}`);
    res.status(500).send(`Failed to get history of notebook ${notebookId}`);
  }
}


module.exports = (io) => {
  router.get("/", getAllNotebooks);
  router.get("/:id/history", getNotebookHistory);
  router.get("/notebook/:id", getNotebookById);
  router.post("/", (req, res) => storeNotebook(req, res, io));

  return router;
};
