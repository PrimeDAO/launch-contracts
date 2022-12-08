const { getBalancerContractAddress } = require("@balancer-labs/v2-deployments");

const deployFunction = async ({
  getNamedAccounts,
  deployments,
  ethers,
  network,
}) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const liquidityBootstrappingPoolFactoryTaskId =
    "20211202-no-protocol-fee-lbp";
  const contractName = "LiquidityBootstrappingPoolFactory";

  // Balancer contracts are not deployed on Celo and Alfajores, so we're using Symmetric/root instead
  const lbpFactoryAddress =
    network.name === "celo"
      ? "0xdF87a2369FAa3140613c3C5D008A9F50B3303fD3" // can be found https://docs.symmetric.exchange/general-resources-and-tools/symmetric-contract-addresses#v2-contracts
      : network.name === "goerli"
      ? "0xb48Cc42C45d262534e46d5965a9Ac496F1B7a830" // can be found https://dev.balancer.fi/references/contracts/deployment-addresses
      : // ToDo: Need to be updated to new package
        await getBalancerContractAddress(
          liquidityBootstrappingPoolFactoryTaskId,
          contractName,
          network.name
        );

  await deploy("LBPManagerFactoryV1NoAccessControl", {
    from: root,
    args: [lbpFactoryAddress],
    log: true,
  });

  const { address: lbpManagerAddress } = await deploy("LBPManagerV1", {
    from: root,
    args: [],
    log: true,
  });

  const lbpManagerFactoryInstance = await ethers.getContract(
    "LBPManagerFactoryV1NoAccessControl"
  );

  await lbpManagerFactoryInstance.setMasterCopy(lbpManagerAddress);
};

module.exports = deployFunction;
module.exports.tags = ["LBPNoAccessControl"];
