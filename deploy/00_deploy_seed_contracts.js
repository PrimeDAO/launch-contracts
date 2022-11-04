const { getSafeAddress } = require("../lib/params/safeAddresses");

const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  console.log('------------------------------------------------------------------------------------------')
  const { deploy } = deployments;
  const { root } = await getNamedAccounts();
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: 00_deploy_seed_contracts.js ~ line 6 ~ root', root)

  const safeAddress = getSafeAddress(root);
  const LOCAL_CHAIN_ID = 31337;
  const chainId = network.config.chainId ?? LOCAL_CHAIN_ID;
  if (chainId !== LOCAL_CHAIN_ID) return;

  // Ethereum Mainnet safe
  // https://github.com/PrimeDAO/contracts-v2/blob/main/deployments/mainnet/Safe.json

  const { address: seedAddress } = await deploy("Seed", {
    from: root,
    args: [],
    log: true,
  });
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: 00_deploy_seed_contracts.js ~ line 58 ~ seedAddress', seedAddress)

  await deploy("SeedFactory", {
    from: root,
    args: [seedAddress],
    log: true,
  });

  const seedFactoryInstance = await ethers.getContract("SeedFactory");

  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: 00_deploy_seed_contracts.js ~ line 30 ~ seedFactoryInstance.address', seedFactoryInstance.address)

  await seedFactoryInstance.transferOwnership(safeAddress);
  // await execute(
  //   "SeedFactory",
  //   { from: root, log: true, gasPrice: 10000000000 },
  //   "setMasterCopy",
  //   seedAddress
  // );

  console.log("--- deploying Multicall");
  await deploy("Multicall", {
    from: root,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log("--- deploy tokens");
  await deploy("D2D", {
    from: root,
    args: [],
    log: true,
  });
  await deploy("TestToken", {
    from: root,
    args: [],
    log: true,
  });

  console.log("---");
};

module.exports = deployFunction;
module.exports.tags = ["Seed", "D2D"];
