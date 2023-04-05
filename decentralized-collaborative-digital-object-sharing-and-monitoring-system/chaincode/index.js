/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assetTransfer = require('./lib/assetTransfer');
const notebookContract = require('./lib/notebookContract');
const registerContract = require('./lib/registerContract');

module.exports.assetTransfer = assetTransfer;
module.exports.notebookContract = notebookContract;
module.exports.contracts = [assetTransfer, notebookContract, registerContract];
