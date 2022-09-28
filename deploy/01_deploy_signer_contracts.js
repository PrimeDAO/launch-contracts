const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();

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

  const lbpManagerFactoryInstance = await ethers.getContract(
    "LBPManagerFactory"
  );
  const seedFactoryInstance = await ethers.getContract("SeedFactory");

  const deployLBPManagerFunctionSignature =
    await lbpManagerFactoryInstance.interface.getSighash("deployLBPManager");

  const deploySeedFunctionSignature =
    await seedFactoryInstance.interface.getSighash("deploySeed");

  await deploy("SignerV2", {
    from: root,
    args: [
      safeAddress,
      [seedFactoryInstance.address],
      [deploySeedFunctionSignature],
    ],
    log: true,
  });
};

module.exports = deployFunction;
module.exports.tags = ["Signer"];
