/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin } = require("./util/CAUtil.js");
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require("./util/AppUtil.js");

const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';

async function connectToOrg1CA() {
    console.log('\n--> Enrolling the Org1 CA admin');
    const ccpOrg1 = buildCCPOrg1();
    const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1.example.com');

    const walletPathOrg1 = path.join(__dirname, 'wallet/org1');
    const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

    await enrollAdmin(caOrg1Client, walletOrg1, mspOrg1);
}

async function connectToOrg2CA() {
    console.log('\n--> Enrolling the Org2 CA admin');
    const ccpOrg2 = buildCCPOrg2();
    const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2.example.com');

    const walletPathOrg2 = path.join(__dirname, 'wallet/org2');
    const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

    await enrollAdmin(caOrg2Client, walletOrg2, mspOrg2);
}

exports.connectToOrg1CA = connectToOrg1CA;
exports.connectToOrg2CA = connectToOrg2CA;

// main();
