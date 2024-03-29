"use strict";

const { Contract } = require("fabric-contract-api");
const stringify = require("json-stable-stringify-without-jsonify");
const deepSortObject = require("deep-sort-object");

class AccessContract extends Contract {
  constructor() {
    super("AccessContract");
  }

  async requestAccess(
    ctx,
    notebookName,
    username,
    userId,
    userType,
    affiliation,
    timestamp
  ) {
    console.log(
      `Requesting access for user ${username} to notebook ${notebookName}`
    );
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());

    const userAccess = notebook.ACL.accessList.filter(
      (entry) => entry.userId === userId,
      null
    );

    if (userAccess.length === 0) {
      notebook.ACL.accessList.push({
        username: username,
        userId: userId,
        status: "pending",
        userType: userType,
        affiliation: affiliation,
        timestamp: timestamp,
      });
    } else {
      userAccess[0].status = "pending";
    }

    await ctx.stub.putState(
      notebookName,
      Buffer.from(stringify(deepSortObject(notebook)))
    );
  }

  async manageAccess(ctx, notebookName, userId, action, expiryDate) {
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }

    const notebook = JSON.parse(notebookAsBytes.toString());

    const userAccess = notebook.ACL.accessList
      .filter((entry) => entry.userId === userId)
      .reduce((latest, entry) => {
        return !latest || new Date(entry.timestamp) > new Date(latest.timestamp)
          ? entry
          : latest;
      }, null);
    if (action.toLowerCase() === "approve") {
      console.log(notebook.ACL.accessList);
      console.log("User access", userAccess);
      if (userAccess && userAccess.status === "pending") {
        userAccess.status = "approved";
        userAccess.expiryDate = expiryDate;
        if (expiryDate === "9999-12-31T23:59:59.000Z") {
          // if expiry date is 'indefinite'
          userAccess.indefiniteAccess = true; // Add an attribute to signify indefinite access
        } else {
          userAccess.indefiniteAccess = false;
        }
        await ctx.stub.putState(
          notebookName,
          Buffer.from(stringify(deepSortObject(notebook)))
        );
      } else {
        throw new Error(`No pending access request for user ID ${userId}`);
      }
    } else if (action.toLowerCase() === "reject") {
      if (userAccess && userAccess.status === "pending") {
        userAccess.status = "rejected";
        console.log("Notebook:", notebook);
        await ctx.stub.putState(
          notebookName,
          Buffer.from(stringify(deepSortObject(notebook)))
        );
      } else {
        throw new Error(`No pending access request for user ID ${userId}`);
      }
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
    return JSON.stringify({ message: "Access request managed successfully" });
  }

  async getRequests(ctx, adminId) {
    const startKey = "";
    const endKey = "";
    const allRequests = [];

    for await (const { key, value } of ctx.stub.getStateByRange(
      startKey,
      endKey
    )) {
      const strValue = Buffer.from(value).toString("utf8");
      const record = JSON.parse(strValue);
      if (record.docType === "notebook" && record.ACL.owner === adminId) {
        const pendingRequests = record.ACL.accessList.filter(
          (entry) => entry.status === "pending"
        );
        if (pendingRequests.length > 0) {
          allRequests.push({
            notebookId: key,
            notebookName: record.name,
            requests: pendingRequests,
          });
        }
      }
    }
    console.log(`Retrieved all requests: ${JSON.stringify(allRequests)}`);
    return JSON.stringify(allRequests);
  }

  async getApprovedUsers(ctx, userId) {
    const startKey = "";
    const endKey = "";
    const allResults = [];

    for await (const { key, value } of ctx.stub.getStateByRange(
      startKey,
      endKey
    )) {
      const strValue = Buffer.from(value).toString("utf8");
      const record = JSON.parse(strValue);

      if (record.docType === "notebook" && record.ACL.owner === userId) {
        const approvedUsers = record.ACL.accessList.filter(
          (entry) => entry.status === "approved"
        );
        if (approvedUsers.length > 0) {
          allResults.push({ Key: key, Record: record });
        }
      }
    }
    console.log(`Retrieved all notebooks: ${JSON.stringify(allResults)}`);
    return JSON.stringify(allResults);
  }

  async removeAccess(ctx, notebookName, userId) {
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());

    const userAccess = notebook.ACL.accessList.find(
      (entry) => entry.userId === userId
    );
    if (userAccess) {
      userAccess.status = "removed";
      userAccess.hasEditAccess = false;
      await ctx.stub.putState(
        notebookName,
        Buffer.from(stringify(deepSortObject(notebook)))
      );
    } else {
      throw new Error(`No access granted to user ID ${userId}`);
    }

    return JSON.stringify({ message: "Access removed successfully" });
  }
  async toggleEditAccess(ctx, notebookName, userId) {
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());

    const userAccess = notebook.ACL.accessList.find(
      (entry) => entry.userId === userId
    );

    if (userAccess) {
      if (userAccess.status === "approved") {
        // Toggle the hasEditAccess property
        userAccess.hasEditAccess = !userAccess.hasEditAccess;
        await ctx.stub.putState(
          notebookName,
          Buffer.from(stringify(deepSortObject(notebook)))
        );
      } else {
        throw new Error(`User ID ${userId} has not been approved`);
      }
    } else {
      throw new Error(`No access granted to user ID ${userId}`);
    }

    return JSON.stringify({ hasEditAccess: userAccess.hasEditAccess });
  }

  async checkExpiry(ctx, notebookName, userId) {
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());
    let updateNotebookState = false;

         notebook.ACL.accessList.forEach((userAccess) => {
           if (userAccess.userId === userId) {
             // Check if indefiniteAccess is true. If yes, skip this iteration
             if (userAccess.indefiniteAccess) {
               console.log("Infinite access for user ID", userId);
               return true;
             }

             if (userAccess.status === "approved" && userAccess.expiryDate && userAccess.indefiniteAccess === false) {
               if (new Date(Date.now()) > new Date(userAccess.expiryDate)) {
                 userAccess.status = "expired";
                 updateNotebookState = true;
                 return false;
               }
             } else if (userAccess.status === "pending") {
               console.log("Access still pending for user ID", userId);
             }
           }
            return true;
         });

    // Update the state only once, after all userAccess has been checked
    if (updateNotebookState) {
      console.log("At least one user's access expired");
      await ctx.stub.putState(
        notebookName,
        Buffer.from(stringify(deepSortObject(notebook)))
      );
      return JSON.stringify({ message: "Access expired" });
    } else {
      return JSON.stringify({ message: "Access not expired" });
    }
  }
}
module.exports = AccessContract;
