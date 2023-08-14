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

    if (!notebook.owner || notebook.owner.trim() === "") {
      throw new Error("Notebook owner is missing or empty");
    }

    const hash = crypto.createHash("sha256");
    hash.update(notebook.owner);
    const ownerHash = hash.digest("hex");
    return `${notebook.name}_${ownerHash}`;
  }

  async storeNotebook(ctx, notebookJson) {
    const newNotebook = JSON.parse(notebookJson);
    newNotebook.docType = "notebook";

    const notebookKey = await this.generateNotebookKey(newNotebook);

    // Fetch existing notebook from the ledger
    const notebookAsBytes = await ctx.stub.getState(notebookKey);

    if (notebookAsBytes && notebookAsBytes.length > 0) {
      // If notebook already exists, preserve the existing ACL
      const existingNotebook = JSON.parse(notebookAsBytes.toString());
      newNotebook.ACL = existingNotebook.ACL;
    } else {
      // If notebook doesn't exist, create a new ACL
      newNotebook.ACL = {
        owner: newNotebook.owner,
        accessList: [],
      };
    }

    console.log(`Storing notebook ${JSON.stringify(newNotebook)}`);
    console.log(ctx);

    await ctx.stub.putState(
      notebookKey,
      Buffer.from(stringify(deepSortObject(newNotebook)))
    );
    return notebookKey;
  }

  async getNotebook(ctx, notebookId) {
    const notebookAsBytes = await ctx.stub.getState(notebookId);
    if (!notebookAsBytes || notebookAsBytes.length === 0) {
      throw new Error(`The notebook with id ${notebookId} does not exist`);
    }
    const notebook = JSON.parse(notebookAsBytes.toString());
    console.log(`Retrieved notebook ${JSON.stringify(notebook)}`);
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

  async getNotebookHistory(ctx, notebookId) {
    const historyIterator = await ctx.stub.getHistoryForKey(notebookId);
    const history = [];
    while (true) {
      let historyRecord = await historyIterator.next();
      console.log(historyRecord);
      if (historyRecord.value && historyRecord.value.value) {
        let jsonRes = {};
        jsonRes.TxId = historyRecord.value.txId;
        jsonRes.Timestamp = historyRecord.value.timestamp;
        jsonRes.IsDelete = historyRecord.value.is_delete
          ? historyRecord.value.is_delete.toString()
          : "undefined";
        try {
          jsonRes.Value = JSON.parse(
            historyRecord.value.value.toString("utf8")
          );
        } catch (err) {
          console.log(err);
          jsonRes.Value = historyRecord.value.value.toString("utf8");
        }
        history.push(jsonRes);
      }
      if (historyRecord.done) {
        await historyIterator.close();
        console.info(history);
        return history;
      }
    }
  }

  async initializeLedger(ctx) {
    const notebook = {
      name: "Untitled8.ipynb",
      owner: "John Doe",
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
