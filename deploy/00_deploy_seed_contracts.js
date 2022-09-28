const { network } = require("hardhat");

const deployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, execute } = deployments;
  const { root } = await getNamedAccounts();
  let safeAddress;

  // Ethereum Mainnet safe
  // https://github.com/PrimeDAO/contracts-v2/blob/main/deployments/mainnet/Safe.json

  const networkName = network.name;
  switch (networkName) {
    case "mainnet":
      safeAddress = "0x52F50f557704938Df066EC4Db7426D66538E7796";
      break;
    case "rinkeby":
      safeAddress = "0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C";
      break;
    case "celo":
      safeAddress = "0x0276a552F424949C934bC74bB623886AAc9Ed807";
      break;
    default:
      safeAddress = root;
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
    safeAddress
  );
};

module.exports = deployFunction;
module.exports.tags = ["Seed"];
