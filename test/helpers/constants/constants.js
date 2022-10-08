const deploy = {
  SEEDFACTORY: "SeedFactory",
  SEED: "Seed",
};

const types = {
  SEED_DEPLOY_INSTANCE: 0,
  SEED_INITIALIZE: 1,
  SEEDFACTORY_DEPLOY_INSTANCE: 2,
  SEEDFACTORY_DEPLOY_SEED: 3,
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
  deploy,
  types,
  seedTokenParams,
  fundingTokenParams,
};
