const { getSafeAddress } = require("../lib/params/safeAddresses");

const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const safeAddress = getSafeAddress();

  const { address: seedAddress } = await deploy("SeedV2", {
    from: root,
    args: [],
    log: true,
  });

  await deploy("SeedFactoryV2", {
    from: root,
    args: [seedAddress],
    log: true,
  });

  const seedFactoryInstance = await ethers.getContract("SeedFactoryV2");

  await seedFactoryInstance.transferOwnership(safeAddress);
};

module.exports = deployFunction;
module.exports.tags = ["SeedV2"];
