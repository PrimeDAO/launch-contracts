// This file is used to construct the arguments to verify the SignerV2 contract.

const { getSafeAddress } = require("../safeAddresses");

// ToDo: make constructing the verify arguments dynamcally
// https://app.shortcut.com/curvelabs/story/1388/create-script-to-verify-contracts-dynamically
module.exports = [
  getSafeAddress(),
  ["0x953ACa991b76D0c5Da56d339DB10ce66c0442E30"],
  ["0x086c048f"],
];
