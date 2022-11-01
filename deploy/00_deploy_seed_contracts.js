const { getSafeAddress } = require("../lib/params/safeAddresses");

const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const safeAddress = getSafeAddress();

  const { address: seedAddress } = await deploy("Seed", {
    from: root,
    args: [],
    log: true,
  });

  await deploy("SeedFactory", {
    from: root,
    args: [seedAddress],
    log: true,
  });

  const seedFactoryInstance = await ethers.getContract("SeedFactory");

  await seedFactoryInstance.transferOwnership(safeAddress);
};

module.exports = deployFunction;
module.exports.tags = ["Seed"];
