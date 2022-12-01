const { getSafeAddress } = require("../lib/params/safeAddresses");

// const ONE_18_DECIMALS = 1_000000000000000000
// const INITIAL_SUPPLY = 100000000_000000000000000000

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
    args: ["Prime", "D2D"],
    log: true,
  });

  await deploy("TestToken", {
    from: root,
    args: [],
    log: true,
  });

  // Setup tokens for each account

  // Hardhat default addresse
  const Class1_User1_Address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  const Class1_User2_Address = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
  const Class2_User1_Address = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
  const Class2_User2_Address = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
  const Class3_User1_Address = "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
  const Class1_NewlyAdded1_Address = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"

  // const testTokenInstance = await ethers.getContract("TestToken");
  // testTokenInstance.transfer(Class1_User1_Address, "1000000000000000000000000")
  // testTokenInstance.transfer(Class1_User2_Address, "1000000000000000000000000")
  // testTokenInstance.transfer(Class2_User1_Address, "1000000000000000000000000")
  // testTokenInstance.transfer(Class2_User2_Address, "1000000000000000000000000")
  // testTokenInstance.transfer(Class3_User1_Address, "1000000000000000000000000")

  const D2DInstance = await ethers.getContract("D2D");
  D2DInstance.transfer(Class1_User1_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class1_User2_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class2_User1_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class2_User2_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class3_User1_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class3_User1_Address, "1000000000000000000000000")
  D2DInstance.transfer(Class1_NewlyAdded1_Address, "1000000000000000000000000")

  console.log("---");
};

module.exports = deployFunction;
module.exports.tags = ["Seed", "D2D"];
