const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const {
  utils: { parseUnits, parseEther },
} = ethers;

const { getNamedTestSigners } = require("../accounts/signers");
const { getTokenAmount, getDecimals } = require("../types/typesConverter");
const {
  TEN_DAYS,
  HUNDRED_DAYS,
  TWENTY_SEC,
  SEVEN_DAYS,
} = require("../types/time");
const {
  types,
  seedTokenParams,
  fundingTokenParams,
} = require("../types/types");

async function getDefaultSeedParams(params) {
  const { root, beneficiary, admin } = await getNamedTestSigners();
  const seedTokenInstance = params.tokenInstances[0];
  const fundingTokenInstance = params.tokenInstances[1];

  // Convert Funding and Seed token amount from decimal 16 -> 18
  const seedTokenDecimal = (await getDecimals(seedTokenInstance)).toString();
  const fundingTokenDecimal = (
    await getDecimals(fundingTokenInstance)
  ).toString();
  const getFundingAmounts = getTokenAmount(fundingTokenDecimal);

  const startTime = (await time.latest()).add(TWENTY_SEC);
  const endTime = await startTime.add(SEVEN_DAYS);
  const softCap = getFundingAmounts("10").toString();
  const hardCap = getFundingAmounts("102").toString();
  const price = parseUnits(
    "0.01",
    parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
  ).toString();
  const defaultClassParameters = [
    getFundingAmounts("10").toString(),
    TEN_DAYS.toNumber(),
    HUNDRED_DAYS.toNumber(),
  ];
  const permissioned = false;
  const allowlist = [];
  const tipPercentage = parseEther("0.02").toString();
  const tipVestingCliff = TEN_DAYS.toNumber();
  const tipVestingDuration = HUNDRED_DAYS.toNumber();
  const tipping = [tipPercentage, tipVestingCliff, tipVestingDuration];

  return {
    from: root.address,
    beneficiary: beneficiary.address,
    admin: admin.address,
    tokenAddresses: [seedTokenInstance.address, fundingTokenInstance.address],
    softAndHardCaps: [softCap, hardCap],
    price: price,
    startAndEndTime: [startTime.toNumber(), endTime.toNumber()],
    defaultClassParameters: defaultClassParameters,
    permissionedSeed: permissioned,
    allowlist: allowlist,
    tipping: tipping,
  };
}

async function seedInitParams(params) {
  const defaultParams = await getDefaultSeedParams(params);

  if (!params.from) params.from = defaultParams.from;
  if (!params.beneficiary) params.beneficiary = defaultParams.beneficiary;
  if (!params.admin) params.admin = defaultParams.admin;
  if (!params.tokenAddresses)
    params.tokenAddresses = defaultParams.tokenAddresses;
  if (!params.softAndHardCaps)
    params.softAndHardCaps = defaultParams.softAndHardCaps;
  if (!params.price) params.price = defaultParams.price;
  if (!params.startAndEndTime)
    params.startAndEndTime = defaultParams.startAndEndTime;
  if (!params.defaultClassParameters)
    params.defaultClassParameters = defaultParams.defaultClassParameters;
  if (!params.permissionedSeed)
    params.permissionedSeed = defaultParams.permissionedSeed;
  if (!params.allowlist) params.allowlist = defaultParams.allowlist;
  if (!params.tipping) params.tipping = defaultParams.tipping;

  return [
    params.beneficiary,
    params.admin,
    params.tokenAddresses,
    params.softAndHardCaps,
    params.price,
    params.startAndEndTime,
    params.defaultClassParameters,
    params.permissionedSeed,
    params.allowlist,
    params.tipping,
  ];
}

async function seedFactoryDeploySeedParams(params) {
  // console.log(params);
  const defaultMetadata =
    "0x516d63794c7676616d4d44646b65566b4d50686674724b506b445964443344673541434758594371794d76774a32";
  const defaultParams = await seedInitParams(params);
  // console.log("seedParams", defaultParams);

  defaultParams.push(!params.metadata ? defaultMetadata : params.metadata);

  return defaultParams;
}

const seedDeployParams = (params) => {
  return {
    from: params.from,
    args: params.args,
  };
};

async function convertParams(type, params) {
  switch (type) {
    case types.SEED_INITIALIZE:
      return await seedInitParams(params);
    case types.SEEDFACTORY_DEPLOY_SEED:
      return await seedFactoryDeploySeedParams(params);
    case types.SEED_DEPLOY_INSTANCE || types.SEEDFACTORY_DEPLOY_INSTANCE:
      return seedDeployParams(params);
  }
}

const tokenParams = () => [seedTokenParams, fundingTokenParams];

module.exports = {
  convertParams,
  seedFactoryDeploySeedParams,
  tokenParams,
};
