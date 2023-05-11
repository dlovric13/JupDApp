"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class RegisterChaincode extends Contract {
  constructor() {
    super("RegisterContract");
  }

  generateUserId(username, email) {
    const hash = crypto.createHash("sha256");
    hash.update(`${username}_${email}`);
    return hash.digest("hex");
  }

  async registerUser(ctx, userData, userType, affiliation) {
    const dataToStore = {
      ...JSON.parse(userData),
      userType: userType,
      affiliation: affiliation,
    };

    // Generate userId and store it in dataToStore
    console.log("User data:", dataToStore);
    const userId = this.generateUserId(dataToStore.username, dataToStore.email);
    dataToStore.userId = userId;
    await ctx.stub.putState(dataToStore.username, Buffer.from(JSON.stringify(dataToStore)));
  }

  async loginUser(ctx, username) {
    const userAsBytes = await ctx.stub.getState(username);

    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${username} does not exist`);
    }

    const user = JSON.parse(userAsBytes.toString());
    return JSON.stringify({
      password: user.password,
      affiliation: user.affiliation,
      userType: user.userType,
      userID: user.userId,
    });
  }

  async getUser(ctx, username) {
    const userAsBytes = await ctx.stub.getState(username);

    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${username} does not exist`);
    }

    return userAsBytes.toString();
  }

  async updateUser(ctx, userData) {
    const newData = JSON.parse(userData);
    const username = newData.username;

    const userAsBytes = await ctx.stub.getState(username);

    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${username} does not exist`);
    }

    const user = JSON.parse(userAsBytes.toString());
    const updatedUser = {
      ...user,
      ...newData,
    };

    await ctx.stub.putState(username, Buffer.from(JSON.stringify(updatedUser)));
  }

  async deleteUser(ctx, username) {
    const userAsBytes = await ctx.stub.getState(username);

    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${username} does not exist`);
    }

    await ctx.stub.deleteState(username);
  }
}

module.exports = RegisterChaincode;
