"use strict";

const { Contract } = require("fabric-contract-api");

class RegisterChaincode extends Contract {
  constructor() {
    super("RegisterContract");
  }

  async registerUser(ctx, userData, role) {
    const dataToStore = {
      ...JSON.parse(userData),
      role: role,
    };

    // Use the username as the key instead of the whole userData object
    const username = dataToStore.username;
    await ctx.stub.putState(username, Buffer.from(JSON.stringify(dataToStore)));
  }

  //   async loginUser(ctx, username, hashedPassword) {
  //     const userAsBytes = await ctx.stub.getState(username);

  //     if (!userAsBytes || userAsBytes.length === 0) {
  //       throw new Error(`User ${username} does not exist`);
  //     }

  //     const user = JSON.parse(userAsBytes.toString());
  //     if (user.password === hashedPassword) {
  //       return JSON.stringify(user);
  //     } else {
  //       throw new Error("Invalid password");
  //     }
  //   }

  async loginUser(ctx, username) {
    const userAsBytes = await ctx.stub.getState(username);

    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User ${username} does not exist`);
    }

    const user = JSON.parse(userAsBytes.toString());
    return JSON.stringify({
      password: user.password,
      affiliation: user.affiliation,
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
