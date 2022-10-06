const { ethers } = require("hardhat");
const {
  getDecimals,
  getTokenAmount,
} = require("../lib/helpers/conversions.js");

const {
  utils: { parseEther, parseUnits },
} = ethers;

const { time } = require("@openzeppelin/test-helpers");

let softCap;
let hardCap;
let price;
let startTime;
let endTime;

// constants
const sevenDaysInSeconds = time.duration.days(7);
const tenDaysInSeconds = time.duration.days(10);
const hundredDaysInSeconds = time.duration.days(100);
const twentySeconds = time.duration.seconds(20);

async function launchFixture() {
  // ---------------------------------------------------------------------------------------------
  // Signers
  const signers = await ethers.getSigners();
  const [root, beneficiary, admin] = signers;

  // ---------------------------------------------------------------------------------------------
  // Contract Factories
  //
  // SeedFactory Factory
  const SeedFactoryFactory = await ethers.getContractFactory(
    "SeedFactory",
    root.address
  );
  // Seed Factory
  const SeedFactory = await ethers.getContractFactory("Seed", root.address);
  // Mock ERC20 Factory
  const CustomDecimalERC20Mock = await ethers.getContractFactory(
    "CustomDecimalERC20Mock",
    root
  );

  // ---------------------------------------------------------------------------------------------
  // Contract instances
  //
  // Tokens
  // Funding Token Instance
  const fundingTokenInstance = await CustomDecimalERC20Mock.deploy(
    "USDC",
    "USDC",
    16
  );
  // Seed Token Instance
  const seedTokenInstance = await CustomDecimalERC20Mock.deploy(
    "Prime",
    "Prime",
    12
  );
  // Seed Instances
  const uninitializedSeedInstance = await SeedFactory.deploy();
  const initializedSeedInstance = await SeedFactory.deploy();
  // SeedFactory Instance
  const uninitializedSeedFactoryInstance = await SeedFactoryFactory.deploy();
  const initializedSeedFactoryInstance = await SeedFactoryFactory.deploy();

  // ---------------------------------------------------------------------------------------------
  // Token Decimal Conversion
  //
  // Convert Funding and Seed token amount from decimal 16 -> 18
  const seedTokenDecimal = (await getDecimals(seedTokenInstance)).toString();
  const fundingTokenDecimal = (
    await getDecimals(fundingTokenInstance)
  ).toString();
  const getFundingAmounts = getTokenAmount(fundingTokenDecimal);
  // const getSeedAmounts = getTokenAmount(seedTokenDecimal);

  // ---------------------------------------------------------------------------------------------
  // Base Seed Arguments
  startTime = (await time.latest()).add(twentySeconds);
  endTime = await startTime.add(sevenDaysInSeconds);
  softCap = getFundingAmounts("10").toString();
  hardCap = getFundingAmounts("102").toString();
  price = parseUnits(
    "0.01",
    parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
  ).toString();
  const defaultClassParameters = [
    parseUnits("10"),
    tenDaysInSeconds.toNumber(),
    hundredDaysInSeconds.toNumber(),
  ];
  const permissioned = false;
  const whitelistAddresses = [];
  const tipPercentage = parseEther("0.02").toString();
  const tipVestingCliff = tenDaysInSeconds.toNumber();
  const tipVestingDuration = hundredDaysInSeconds.toNumber();
  const tipping = [tipPercentage, tipVestingCliff, tipVestingDuration];
  const metadata =
    "0x516d63794c7676616d4d44646b65566b4d50686674724b506b445964443344673541434758594371794d76774a32";

  // ---------------------------------------------------------------------------------------------
  // Specific Arguments
  //
  // SeedFactory Init arguments
  const seedFactoryArgs = [
    beneficiary.address,
    admin.address,
    [seedTokenInstance.address, fundingTokenInstance.address],
    [softCap, hardCap],
    price,
    [startTime.toNumber(), endTime.toNumber()],
    defaultClassParameters,
    permissioned,
    whitelistAddresses,
    tipping,
    metadata,
  ];
  // Seed Init arguments
  const seedArguments = [
    beneficiary.address,
    admin.address,
    [seedTokenInstance.address, fundingTokenInstance.address],
    [softCap, hardCap],
    price,
    [startTime.toNumber(), endTime.toNumber()],
    defaultClassParameters,
    permissioned,
    whitelistAddresses,
    tipping,
  ];

  // ---------------------------------------------------------------------------------------------
  // Setup Contract Instances
  //
  // SeedFactory Instances
  await initializedSeedFactoryInstance.setMasterCopy(
    uninitializedSeedInstance.address
  );
  // Seed Instances
  await initializedSeedInstance.initialize(...seedArguments);

  return {
    uninitializedSeedFactoryInstance,
    initializedSeedFactoryInstance,
    uninitializedSeedInstance,
    initializedSeedInstance,
    SeedFactory,
    seedFactoryArgs,
    seedArguments,
    root,
    beneficiary,
    admin,
    seedTokenInstance,
    fundingTokenInstance,
    softCap,
    hardCap,
    price,
    startTime,
    endTime,
    defaultClassParameters,
    permissioned,
    whitelistAddresses,
    tipping,
    metadata,
    getFundingAmounts,
  };
}

module.exports = {
  launchFixture,
};
