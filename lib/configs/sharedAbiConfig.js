const ownDeployedContracts = {
  D2D: {
    abi: "ERC20",
  },
};

// Add external contract addresses like DAI below
const externalContracts = {
  goerli: {},
  mainnet: {},
  kovan: {},
  alfajores: {},
  celo: {},
};

module.exports = {
  goerli: { ...ownDeployedContracts, ...externalContracts.goerli },
  mainnet: { ...ownDeployedContracts, ...externalContracts.mainnet },
  kovan: { ...ownDeployedContracts, ...externalContracts.kovan },
  alfajores: { ...ownDeployedContracts, ...externalContracts.alfajores },
  celo: { ...ownDeployedContracts, ...externalContracts.celo },
};
