/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const { buildCAClient, registerAndEnrollUser } = require("./util/CAUtil.js");
const {
  buildCCPOrg1,
  buildCCPOrg2,
  buildWallet,
} = require("./util/AppUtil.js");
const argon2 = require("argon2");

const mspOrg1 = "Org1MSP";
const mspOrg2 = "Org2MSP";

async function connectToOrg1CA(
  adminId,
  username,
  email,
  password,
  userType,
  affiliation
) {
  console.log("\n--> Register and enrolling new user");
  const ccpOrg1 = buildCCPOrg1();
  const caOrg1Client = buildCAClient(
    FabricCAServices,
    ccpOrg1,
    "ca.org1.example.com"
  );

  const walletPathOrg1 = path.join(__dirname, "wallet/org1");
  const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

  const identities = await walletOrg1.list();
  console.log("Identities in walletOrg1:", identities);
  const adminIdentity = await walletOrg1.get(adminId);
  console.log("Admin user identity:", adminIdentity);

  //  await listUsersInWallet(walletOrg1, mspOrg1);

  await registerAndEnrollUser(
    caOrg1Client,
    walletOrg1,
    mspOrg1,
    username,
    affiliation
  );
  await registerUserToLedger(
    walletOrg1,
    username,
    mspOrg1,
    {
      username: username,
      email: email,
      password: password,
    },
    userType,
    adminId
  );
}

async function connectToOrg2CA(
  adminId,
  username,
  email,
  password,
  userType,
  affiliation
) {
  console.log("\n--> Register and enrolling new user");
  const ccpOrg2 = buildCCPOrg2();
  const caOrg2Client = buildCAClient(
    FabricCAServices,
    ccpOrg2,
    "ca.org2.example.com"
  );

  const walletPathOrg2 = path.join(__dirname, "wallet/org2");
  const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

  const adminIdentity = await walletOrg2.get(adminId);
  console.log("Admin user identity:", adminIdentity);
  await registerAndEnrollUser(
    caOrg2Client,
    walletOrg2,
    mspOrg2,
    username,
    affiliation
  );
  await registerUserToLedger(
    walletOrg2,
    username,
    mspOrg2,
    {
      username: username,
      email: email,
      password: password,
    },
    userType,
    adminId
  );
}

async function registerUserToLedger(
  wallet,
  username,
  msp,
  userData,
  userType,
  adminId
) {
  console.log("Current MSP:", JSON.stringify(msp));
  const gateway = new Gateway();
  try {
    const ccp = msp === mspOrg1 ? buildCCPOrg1() : buildCCPOrg2();

    if (msp === mspOrg1) {
      console.log("Using Org1 connection profile");
    } else {
      console.log("Using Org2 connection profile");
    }

    await gateway.connect(ccp, {
      wallet,
      identity: adminId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("digitalobject");

    const hashedPassword = await argon2.hash(userData.password);
    userData.password = hashedPassword;
    console.log(hashedPassword);
    await contract.submitTransaction(
      "RegisterContract:registerUser",
      JSON.stringify(userData),
      userType
    );
    console.log(`Successfully registered user ${username} to the ledger.`);
  } finally {
    gateway.disconnect();
  }
}

async function main(
  organization,
  username,
  email,
  password,
  userType,
  adminId,
  affiliation
) {
  try {
    console.log(`Organization: ${organization}`);
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`UserType: ${userType}`);
    console.log(`AdminId: ${adminId}`);
    console.log(`Affiliation: ${affiliation}`);

    if (organization === "Org1" || organization === "org1") {
    
        await connectToOrg1CA(
          adminId,
          username,
          email,
          password,
          userType,
          affiliation
        );
    } else if (organization === "Org2" || organization === "org2") {
        await connectToOrg2CA(
          adminId,
          username,
          email,
          password,
          userType,
          affiliation
        );
    } else {
      console.log("Usage: node registerEnrollUser.js org userID");
      console.log("Org must be Org1 or Org2");
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

exports.main = main;
