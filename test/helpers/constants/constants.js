const { ethers } = require("hardhat");

const EMPTY32BYTES = ethers.utils.formatBytes32String("");

const PRECISION = ethers.constants.WeiPerEther;
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
  SEED_ALLOWLIST: 5,
  SEED_ADD_CLASS_AND_WHITELIST_FROM_NUM: 6,
  SEED_ADD_CLASS_AND_WHITELIST: 7,
  SEED_TOKEN_PARAMS: 8,
};

const classTypes = {
  CLASS_DEFAULT: 0,
  CLASS_1: 1,
  CLASS_2: 2,
  CLASS_3: 3,
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
  PRECISION,
  EMPTY32BYTES,
  deploy,
  types,
  classTypes,
  seedTokenParams,
  fundingTokenParams,
};
