// @ts-check
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const {
  utils: { parseUnits, parseEther, formatBytes32String },
} = ethers;

const { getNamedTestSigners } = require("../accounts/signers");
const { getTokenAmount, getDecimals } = require("../constants/TypesConverter");
const { getERC20TokenInstances } = require("../contracts/tokens/tokens");
const {
  TEN_DAYS,
  HUNDRED_DAYS,
  ONE_MINUTE,
  FOURTY_DAYS,
  SEVEN_DAYS,
  TWENTY_DAYS,
} = require("../constants/time");
const {
  types,
  classTypes,
  seedTokenParams,
  fundingTokenParams,
} = require("../constants/constants");

async function getDefaultSeedParams(params) {
  if (!params.tokenInstances)
    params.tokenInstances = await getERC20TokenInstances(tokenParams());

  const { root, beneficiary, admin } = await getNamedTestSigners();
  const seedTokenInstance = params.tokenInstances[0];
  const fundingTokenInstance = params.tokenInstances[1];
  // Convert Funding and Seed token amount from decimal 16 -> 18
  const seedTokenDecimal = (await getDecimals(seedTokenInstance)).toString();
  const fundingTokenDecimal = (
    await getDecimals(fundingTokenInstance)
  ).toString();
  const getFundingAmounts = getTokenAmount(fundingTokenDecimal);

  const startTime = (await time.latest()).add(ONE_MINUTE);
  const endTime = startTime.add(SEVEN_DAYS);
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
    tokenInstances: [seedTokenInstance, fundingTokenInstance],
  };
}

async function seedInitParams(params) {
  const defaultParams = await getDefaultSeedParams(params);

  params = { ...defaultParams, ...params };

  return [
    defaultParams.tokenInstances,
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
  const defaultMetadata =
    "0x516d63794c7676616d4d44646b65566b4d50686674724b506b445964443344673541434758594371794d76774a32";
  let defaultParams = await seedInitParams(params);

  defaultParams.push(!params.metadata ? defaultMetadata : params.metadata);

  return defaultParams;
}

const createClassParam = (
  className,
  classCap,
  individualCap,
  vestingCliff,
  vestingDuration
) => [className, classCap, individualCap, vestingCliff, vestingDuration];

function getClassParams(params) {
  if (!params) params = {};
  if (!params.fundingTokenDecimal) params.fundingTokenDecimal = 12;
  if (!params.class) params.class = classTypes.CLASS_1;
  const getFundingAmounts = getTokenAmount(params.fundingTokenDecimal);

  switch (params.class) {
    case classTypes.CLASS_1:
      return createClassParam(
        params.className == null
          ? formatBytes32String("Buyers1")
          : formatBytes32String(params.className),
        params.classCap ? params.classCap : getFundingAmounts("20").toString(),
        params.individualCap
          ? params.individualCap
          : getFundingAmounts("5").toString(),
        params.vestingCliff ? params.vestingCliff : TEN_DAYS.toNumber(),
        params.vestingDuration ? params.vestingDuration : TWENTY_DAYS.toNumber()
      );
    case classTypes.CLASS_2:
      return createClassParam(
        params.className == null
          ? formatBytes32String("Buyers2")
          : formatBytes32String(params.className),
        params.classCap ? params.classCap : getFundingAmounts("40").toString(),
        params.individualCap
          ? params.individualCap
          : getFundingAmounts("10").toString(),
        params.vestingCliff ? params.vestingCliff : TWENTY_DAYS.toNumber(),
        params.vestingDuration ? params.vestingDuration : FOURTY_DAYS.toNumber()
      );
  }
}

function getChangeClassParams(params) {
  if (!params.class) params.class = types.CLASS_1;
  const classParams = getClassParams(params);
  return [params.class, ...classParams];
}

const seedDeployParams = (params) => {
  return {
    from: params.from,
    args: params.args,
  };
};

async function getConvertedParams(type, params) {
  switch (type) {
    case types.SEED_INITIALIZE:
      return await seedInitParams(params);
    case types.SEEDFACTORY_DEPLOY_SEED:
      return await seedFactoryDeploySeedParams(params);
    case types.SEED_DEPLOY_INSTANCE || types.SEEDFACTORY_DEPLOY_INSTANCE:
      return seedDeployParams(params);
    case types.SEED_CHANGE_CLASS:
      return getChangeClassParams(params);
  }
}

const tokenParams = () => [seedTokenParams, fundingTokenParams];

module.exports = {
  getConvertedParams,
  seedFactoryDeploySeedParams,
  tokenParams,
  seedInitParams,
};
