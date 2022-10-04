const { ethers } = require("hardhat");

const {
  utils: { parseUnits },
} = ethers;

const getDecimals = async (token) => await token.decimals();

const getTokenAmount = (tokenDecimal) => (amount) =>
  parseUnits(amount, tokenDecimal.toString());

// LBP conversion
module.exports = {
  seedConversion,
  getDecimals,
  getTokenAmount,
};
