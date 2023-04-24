"use strict";

const { Contract } = require("fabric-contract-api");
const stringify = require("json-stable-stringify-without-jsonify");
const deepSortObject = require("deep-sort-object");
const crypto = require("crypto");


class NotebookContract extends Contract {
  constructor() {
    super("NotebookContract");
  }


async generateNotebookKey(notebook) {
  if (!notebook.name || notebook.name.trim() === "") {
    throw new Error("Notebook name is missing or empty");
  }

  const notebookContent = stringify(deepSortObject(notebook.content));
  const hash = crypto.createHash("sha256");
  hash.update(notebookContent);
  const notebookHash = hash.digest("hex");
  return `${notebook.name}_${notebookHash}`;
}

  async storeNotebook(ctx, notebookJson) {
    // console.log(`Storing notebook ${notebook}`);
    // console.log(contract);
    const notebook = JSON.parse(notebookJson);
    notebook.docType = "notebook";
    notebook.ACL = {
      owner: notebook.owner,
      accessList: [],
    };

   
   const notebookKey = await this.generateNotebookKey(notebook);

    console.log(`Storing notebook ${JSON.stringify(notebook)}`);
    console.log(ctx);

    await ctx.stub.putState(
      notebookKey,
      Buffer.from(stringify(deepSortObject(notebook)))
    );
     return notebookKey;
  }

  async getNotebook(ctx, name) {
    const notebookAsBytes = await ctx.stub.getState(name);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${name} does not exist`);
    }
    const notebook = notebookAsBytes.toString();
    console.log(`Retrieved notebook ${notebook}`);
    return notebook;
  }

  async getAllNotebooks(ctx) {
    const startKey = "";
    const endKey = "";
    const allResults = [];

    for await (const { key, value } of ctx.stub.getStateByRange(
      startKey,
      endKey
    )) {
      const strValue = Buffer.from(value).toString("utf8");
      const record = JSON.parse(strValue);
      if (record.docType === "notebook") {
        console.log(`Record for key ${key}: ${strValue}`);
        allResults.push({ Key: key, Record: record });
      }
    }
    console.log(`Retrieved all notebooks: ${JSON.stringify(allResults)}`);
    return JSON.stringify(allResults);
  }

  async requestAccess(ctx, notebookName, userId) {
      console.log(
        `Requesting access for user ${userId} to notebook ${notebookName}`
      );
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());
    notebook.ACL.accessList.push({
      userId: userId,
      status: "pending",
    });
    await ctx.stub.putState(
      notebookName,
      Buffer.from(stringify(deepSortObject(notebook)))
    );
  }

  async manageAccess(ctx, notebookName, userId, action) {
    const notebookAsBytes = await ctx.stub.getState(notebookName);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`${notebookName} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());
    const userAccess = notebook.ACL.accessList.find(
      (entry) => entry.userId === userId
    );
    if (!userAccess) {
      throw new Error(`User ${userId} not found in the access list`);
    }
    userAccess.status = action; // "approved" or "revoked"
    await ctx.stub.putState(
      notebookName,
      Buffer.from(JSON.stringify(notebook))
    );
  }

  async initializeLedger(ctx) {
    const notebook = {
      name: "Untitled8.ipynb",
      path: "Untitled8.ipynb",
      last_modified: "2023-03-10T15:25:33.687246Z",
      created: "2023-03-10T15:25:33.687246Z",
      content: {
        cells: [
          {
            cell_type: "code",
            execution_count: null,
            id: "17a723c1-ee61-4f0b-b06f-34fb5ca402ea",
            metadata: {
              trusted: true,
            },
            outputs: [],
            source:
              "hsdhshdhsdhsd\n\n\nsjsjdjsjsjds\ndkksd\n\nsdsds\n\n\nsjsdjjwdjsjd\nzsdsdsd\nsdhsdhsdhwhewhdkxckxckjxckcsks",
          },
        ],
        metadata: {
          kernelspec: {
            display_name: "Python 3 (ipykernel)",
            language: "python",
            name: "python3",
          },
          language_info: {
            codemirror_mode: {
              name: "ipython",
              version: 3,
            },
            file_extension: ".py",
            mimetype: "text/x-python",
            name: "python",
            nbconvert_exporter: "python",
            pygments_lexer: "ipython3",
            version: "3.10.6",
          },
        },
        nbformat: 4,
        nbformat_minor: 5,
      },
      format: "json",
      mimetype: null,
      size: 640,
      writable: true,
      type: "notebook",
    };
    notebook.docType = "notebook";

    await this.storeNotebook(ctx, JSON.stringify(notebook));
  }
}



module.exports = NotebookContract;
