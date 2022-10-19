const { formatUnits } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
/**
 * @typedef {import("../../../lib/types/types").BigNumber} BigNumber
 * @typedef {import("../../../lib/types/types").Contract} Contract
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

/**
 *
 * @param { BigNumber} value
 * @param {number} decimals
 * @returns {number}
 */
function tokenAmountToPrecisionNormalizedFloat(value, decimals) {
  const precisionNormalized = formatUnits(value, decimals);
  return stringToFloat(precisionNormalized);
}

/**
 *
 * @param {string} value
 * @returns {number}
 */
function stringToFloat(value) {
  return parseFloat(value);
}

// LBP conversion
module.exports = {
  getDecimals,
  getTokenAmount,
  tokenAmountToPrecisionNormalizedFloat,
};
