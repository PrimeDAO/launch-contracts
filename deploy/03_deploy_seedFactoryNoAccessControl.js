const deployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const { address: seedAddress } = await deploy("Seed", {
    from: root,
    args: [],
    log: true,
  });

  await deploy("SeedFactoryNoAccessControl", {
    from: root,
    args: [seedAddress],
    log: true,
  });
};

module.exports = deployFunction;
module.exports.tags = ["SeedNoAccessControl"];
