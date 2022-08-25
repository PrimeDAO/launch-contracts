const { network } = require("hardhat");

const deployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, execute } = deployments;
  const { root } = await getNamedAccounts();
  let safeInstance;

  // Ethereum Mainnet safe
  // https://github.com/PrimeDAO/contracts-v2/blob/main/deployments/mainnet/Safe.json

  const networkName = network.name;
  switch (networkName) {
    case "mainnet":
      safeInstance = "0x52F50f557704938Df066EC4Db7426D66538E7796";
      break;
    default:
      safeInstance = root;
  }

  await deploy("SeedFactory", {
    from: root,
    args: [],
    log: true,
  });

  const { address: seedAddress } = await deploy("Seed", {
    from: root,
    args: [],
    log: true,
  });

  await execute(
    "SeedFactory",
    { from: root, log: true, gasPrice: 10000000000 },
    "setMasterCopy",
    seedAddress
  );
  await execute(
    "SeedFactory",
    { from: root, log: true, gasPrice: 10000000000 },
    "transferOwnership",
    safeInstance
  );
};

module.exports = deployFunction;
module.exports.tags = ["Seed"];
