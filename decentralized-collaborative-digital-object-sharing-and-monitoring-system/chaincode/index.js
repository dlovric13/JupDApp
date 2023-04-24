/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const notebookContract = require('./lib/notebookContract');
const registerContract = require('./lib/registerContract');

module.exports.notebookContract = notebookContract;
module.exports.contracts = [notebookContract, registerContract];
