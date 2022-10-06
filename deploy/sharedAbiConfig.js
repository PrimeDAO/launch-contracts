const ownDeployedContracts = {
  D2D: {
    abi: "ERC20",
  },
};

// Add external contract addresses like DAI below
const externalContracts = {
  rinkeby: {},
  mainnet: {},
  kovan: {},
  alfajores: {},
  celo: {},
  goerli: {},
};

module.exports = {
  rinkeby: { ...ownDeployedContracts, ...externalContracts.rinkeby },
  mainnet: { ...ownDeployedContracts, ...externalContracts.mainnet },
  kovan: { ...ownDeployedContracts, ...externalContracts.kovan },
  alfajores: { ...ownDeployedContracts, ...externalContracts.alfajores },
  celo: { ...ownDeployedContracts, ...externalContracts.celo },
  goerli: { ...ownDeployedContracts, ...externalContracts },
};
