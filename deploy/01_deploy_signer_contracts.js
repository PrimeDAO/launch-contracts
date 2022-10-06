const { getSafeAddress } = require("./args/safeAddresses");

const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

  const lbpManagerFactoryInstance = await ethers.getContract(
    "LBPManagerFactory"
  );
  const seedFactoryInstance = await ethers.getContract("SeedFactory");

  const deployLBPManagerFunctionSignature =
    await lbpManagerFactoryInstance.interface.getSighash("deployLBPManager");

  const deploySeedFunctionSignature =
    await seedFactoryInstance.interface.getSighash("deploySeed");

  console.log(deploySeedFunctionSignature);
  await deploy("SignerV2", {
    from: root,
    args: [
      getSafeAddress(),
      [seedFactoryInstance.address, lbpManagerFactoryInstance.address],
      [deploySeedFunctionSignature, deployLBPManagerFunctionSignature],
    ],
    log: true,
  });
};

module.exports = deployFunction;
module.exports.tags = ["Signer"];
