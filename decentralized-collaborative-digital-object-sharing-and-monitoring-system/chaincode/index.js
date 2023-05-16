/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const notebookContract = require('./lib/notebookContract');
const registerContract = require('./lib/registerContract');
const accessContract = require('./lib/accessContract');

module.exports.notebookContract = notebookContract;
module.exports.contracts = [notebookContract, registerContract, accessContract];
