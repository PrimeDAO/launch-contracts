const { ethers } = require("hardhat");

const EMPTY32BYTES = ethers.utils.formatBytes32String("");

const deploy = {
  SEEDFACTORY: "SeedFactory",
  SEED: "Seed",
};

const types = {
  SEED_DEPLOY_INSTANCE: 0,
  SEED_INITIALIZE: 1,
  SEEDFACTORY_DEPLOY_INSTANCE: 2,
  SEEDFACTORY_DEPLOY_SEED: 3,
  SEED_CHANGE_CLASS: 4,
};

const classTypes = {
  CLASS_1: 0,
  CLASS_2: 1,
};
const seedTokenParams = {
  name: "USDC",
  symbol: "USDC",
  decimals: 16,
};
const fundingTokenParams = {
  name: "D2D",
  symbol: "D2D",
  decimals: 12,
};

module.exports = {
  EMPTY32BYTES,
  deploy,
  types,
  classTypes,
  seedTokenParams,
  fundingTokenParams,
};
