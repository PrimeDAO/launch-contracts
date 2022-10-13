const { ethers } = require("hardhat");
/**
 * @typedef {import("../types/types").BigNumber} BigNumber
 * @typedef {import("../types/types").Contract} Contract
 */

const {
  utils: { parseUnits },
} = ethers;

/**
 *
 * @param {Contract} token
 * @returns {number}
 */
const getDecimals = async (token) => await token.decimals();

/**
 *
 * @param {number | string} tokenDecimal
 * @returns {this}
 */
const getTokenAmount = (tokenDecimal) => (amount) =>
  parseUnits(amount, tokenDecimal.toString());

// LBP conversion
module.exports = {
  getDecimals,
  getTokenAmount,
};
