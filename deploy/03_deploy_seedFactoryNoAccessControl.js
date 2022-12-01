const deployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const { address: seedAddress } = await deploy("SeedV2", {
    from: root,
    args: [],
    log: true,
  });

  await deploy("SeedFactoryV2NoAccessControl", {
    from: root,
    args: [seedAddress],
    log: true,
  });
};

module.exports = deployFunction;
module.exports.tags = ["SeedV2NoAccessControl"];
