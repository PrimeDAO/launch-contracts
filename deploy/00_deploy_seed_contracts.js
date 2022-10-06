const { getSafeAddress } = require("./args/safeAddresses");

const deployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, execute } = deployments;
  const { root } = await getNamedAccounts();

  // Ethereum Mainnet safe
  // https://github.com/PrimeDAO/contracts-v2/blob/main/deployments/mainnet/Safe.json

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
    getSafeAddress()
  );
};

module.exports = deployFunction;
module.exports.tags = ["Seed"];
