const { ethers } = require("hardhat");

const EMPTY32BYTES = ethers.utils.formatBytes32String("");

const PRECISION = ethers.constants.WeiPerEther;
const deploy = {
  SEEDFACTORYV2: "SeedFactoryV2",
  SEEDFACTORYV2NOACCESSCONTROL: "SeedFactoryV2NoAccessControl",
  SEEDV2: "SeedV2",
};

const types = {
  SEEDV2_DEPLOY_INSTANCE: 0,
  SEEDV2_INITIALIZE: 1,
  SEEDFACTORYV2_DEPLOY_INSTANCE: 2,
  SEEDFACTORYV2_DEPLOY_SEED: 3,
  SEEDV2_CHANGE_CLASSES_AND_ALLOWLISTS: 4,
  SEEDV2_ALLOWLIST: 5,
  SEEDV2_ADD_CLASS_AND_WHITELIST_FROM_NUM: 6,
  SEEDV2_ADD_CLASS_AND_WHITELIST: 7,
  SEEDV2_TOKEN_PARAMS: 8,
  SEEDFACTORYV2NOACCESSCONTROL_DEPLOY_INSTANCE: 9,
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
