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
  EIGHTY_DAYS,
  SEVEN_DAYS,
  TWENTY_DAYS,
} = require("../constants/time");
const {
  types,
  classTypes,
  seedTokenParams,
  fundingTokenParams,
} = require("../constants/constants");
/**
 * @typedef {import("../../../lib/types/types").TestParams} TestParams
 * @typedef {import("../../../lib/types/types").SeedInitParams} SeedInitParams
 * @typedef {import("../../../lib/types/types").SignerWithAddress} SignerWithAddress
 * @typedef  {import("../../../lib/types/types").AllowlistParams} AllowlistParams
 * @typedef  {import("../../../lib/types/types").ContributorClassFromContract} ContributorClassFromContract
 * @typedef  {import("../../../lib/types/types").GetClassParamsFromTypeParams} GetClassParamsFromTypeParams
 * @typedef {import("hardhat-deploy/dist/types.js").Address} Address
 */

async function getDefaultSeedParams(params = {}) {
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
    TWENTY_DAYS.toNumber(),
    HUNDRED_DAYS.toNumber(),
  ];
  const permissioned = false;
  const allowlist = [];
  const tipPercentage = parseEther("0.02").toString();
  const tipVestingCliff = TEN_DAYS.toNumber();
  const tipVestingDuration = HUNDRED_DAYS.toNumber();
  const tip = [tipPercentage, tipVestingCliff, tipVestingDuration];

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
    tip: tip,
    tokenInstances: [seedTokenInstance, fundingTokenInstance],
  };
}

/**
 * @param {TestParams} params
 */
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
    params.tip,
  ];
}

async function seedFactoryDeploySeedParams(params) {
  const defaultMetadata =
    "0x516d63794c7676616d4d44646b65566b4d50686674724b506b445964443344673541434758594371794d76774a32";
  let defaultParams = await seedInitParams(params);

  defaultParams.push(!params.metadata ? defaultMetadata : params.metadata);

  return defaultParams;
}

/**
 *
 * @param {string} className
 * @param {string} classCap
 * @param {string} individualCap
 * @param {number} vestingCliff
 * @param {number} vestingDuration
 * @returns {[className: string, classCap: string, individualCap: string, vestingCliff: number, vestingDuration: number]}
 */
const createClassParam = (
  className,
  classCap,
  individualCap,
  vestingCliff,
  vestingDuration
) => [className, classCap, individualCap, vestingCliff, vestingDuration];

/**
 *
 * @param {GetClassParamsFromTypeParams} params
 * @returns {[className: string, classCap: string, individualCap: string, vestingCliff: number, vestingDuration: number]}
 */
function getClassParamsFromType(params = {}) {
  if (!params.fundingTokenDecimal) params.fundingTokenDecimal = 12;
  if (!params.class) params.class = classTypes.CLASS_DEFAULT;
  const getFundingAmounts = getTokenAmount(params.fundingTokenDecimal);

  switch (params.class) {
    case classTypes.CLASS_1:
      return createClassParam(
        params.className == null
          ? formatBytes32String("Buyers Default")
          : formatBytes32String(params.className),
        params.classCap ? params.classCap : getFundingAmounts("10").toString(),
        params.individualCap
          ? params.individualCap
          : getFundingAmounts("8").toString(),
        params.vestingCliff ? params.vestingCliff : TWENTY_DAYS.toNumber(),
        params.vestingDuration
          ? params.vestingDuration
          : HUNDRED_DAYS.toNumber()
      );
    case classTypes.CLASS_2:
      return createClassParam(
        params.className == null
          ? formatBytes32String("Buyers2")
          : formatBytes32String(params.className),
        params.classCap ? params.classCap : getFundingAmounts("30").toString(),
        params.individualCap
          ? params.individualCap
          : getFundingAmounts("8").toString(),
        params.vestingCliff ? params.vestingCliff : TWENTY_DAYS.toNumber(),
        params.vestingDuration ? params.vestingDuration : FOURTY_DAYS.toNumber()
      );
    case classTypes.CLASS_3:
      return createClassParam(
        params.className == null
          ? formatBytes32String("Buyers3")
          : formatBytes32String(params.className),
        params.classCap ? params.classCap : getFundingAmounts("40").toString(),
        params.individualCap
          ? params.individualCap
          : getFundingAmounts("10").toString(),
        params.vestingCliff ? params.vestingCliff : FOURTY_DAYS.toNumber(),
        params.vestingDuration ? params.vestingDuration : EIGHTY_DAYS.toNumber()
      );
    default:
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
  }
}

/**
 * @param {{numberOfRandomClasses: number}} params
 * @returns {Promise<[string[], string[], string[], number[], number[], Address[][]]>}
 */
async function getClassAndWhitelistParamsFromNumber(params) {
  let allowlist2DArray;

  const MIN_NUMBER_OF_ADDRESSES = 3;
  const MAX_NUMBER_OF_ADDRESSES = 16;

  allowlist2DArray = new Array(params.numberOfRandomClasses);

  for (let index = 0; index < params.numberOfRandomClasses; index++) {
    allowlist2DArray[index] = await getAllowlistFromNumber({
      numberOfAllowlist: returnRandomFromInt(
        MIN_NUMBER_OF_ADDRESSES,
        MAX_NUMBER_OF_ADDRESSES
      ),
    });
  }
  const classesParams = getClassParamsFromNumber(params);

  return [...classesParams, allowlist2DArray];
}

/**
 *
 * @param {{classesParameters?: {class1?: any, class2?: any, class3?: any}}} params
 * @returns {Promise<[string[], string[], string[], number[], number[], Address[][]]>}
 *
 */
async function getClassAndWhitelistParams(params = {}) {
  /**
   * @type {[string[], string[], string[], number[], number[]]}
   */
  let classesArray;
  /**
   * @type {Address[][]}
   */
  let allowlistArray;
  let singleClass;
  let tempAllowlist;
  let offset;

  if (!params.classesParameters)
    params.classesParameters = { class1: {}, class2: {} };
  const numberOfClasses = Object.keys(params.classesParameters).length;

  const NUM_OF_CLASS_PARAMS = 5;
  const FIRST_BUYER_INDEX = 9; // skip root, admin, beneficiary, buyer1, buyer2, buyer3

  const signers = await ethers.getSigners();
  offset = 0; // Offset used to get the signer addresses
  classesArray = [...Array(NUM_OF_CLASS_PARAMS)].map(() => Array(0));
  allowlistArray = [...Array(numberOfClasses)].map(() => Array(0));

  // Gets params for single class and concats them to the 2D array
  for (let i = 0; i < numberOfClasses; i++) {
    singleClass = Object.values(params.classesParameters)[i];
    const param = {
      class: i,
      className: singleClass.className,
      classCap: singleClass.classCap,
      individualCap: singleClass.individualCap,
      vestingCliff: singleClass.vestingCliff,
      vestingDuration: singleClass.vestingDuration,
    };
    const temp = getClassParamsFromType(param);
    for (let j = 0; j < temp.length; j++) {
      classesArray[j].push(temp[j]);
    }
  }

  // Gets allowlist for each class and concats them to the 2D array
  for (let i = 0; i < numberOfClasses; i++) {
    singleClass = Object.values(params.classesParameters)[i];

    if (!singleClass.allowlist) {
      tempAllowlist = [
        signers[FIRST_BUYER_INDEX + offset + i].address,
        signers[FIRST_BUYER_INDEX + offset + i + 1].address,
      ];
    } else {
      tempAllowlist = singleClass.allowlist[0];
    }

    offset++;
    allowlistArray[i].push(...tempAllowlist);
  }
  return [...classesArray, allowlistArray];
}

/**
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function returnRandomFromInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @param {{numberOfRandomClasses: number}} params
 * @returns {[classNames: string[], classCaps: string[], individualCaps: string[], vestingCliffs: number[], vestingDurations: number[]]}
 */
function getClassParamsFromNumber(params) {
  let classNames;
  let classCaps;
  let individualCaps;
  let vestingCliffs;
  let vestingDurations;

  const CLASS_CAP_MIN = 15;
  const CLASS_CAP_MAX = 30;
  const INDI_CAP_MIN = 1;
  const INDI_CAP_MAX = 14;
  const VESTING_CLIFF_MIN = 0;
  const VESTING_CLIFF_MAX = TWENTY_DAYS;
  const VESTING_DURATION_MIN = 0;
  const VESTING_DURATION_MAX = FOURTY_DAYS;

  const getFundingAmounts = getTokenAmount(12); // Default fundingTokenDecimal

  classNames = Array(params.numberOfRandomClasses).fill("Buyers ");
  classNames = classNames.map((className, i) => {
    return formatBytes32String(`${className}` + `${i}`);
  });
  classCaps = Array.from({ length: params.numberOfRandomClasses }, () =>
    getFundingAmounts(
      returnRandomFromInt(CLASS_CAP_MIN, CLASS_CAP_MAX).toString()
    ).toString()
  );
  individualCaps = Array.from({ length: params.numberOfRandomClasses }, () =>
    getFundingAmounts(
      returnRandomFromInt(INDI_CAP_MIN, INDI_CAP_MAX).toString()
    ).toString()
  );
  vestingCliffs = Array.from({ length: params.numberOfRandomClasses }, () =>
    returnRandomFromInt(VESTING_CLIFF_MIN, VESTING_CLIFF_MAX)
  );
  vestingDurations = Array.from({ length: params.numberOfRandomClasses }, () =>
    returnRandomFromInt(VESTING_DURATION_MIN, VESTING_DURATION_MAX)
  );

  return [
    classNames,
    classCaps,
    individualCaps,
    vestingCliffs,
    vestingDurations,
  ];
}

/**
 * @param {{numberOfAllowlist: number}} params
 * @returns {Promise<Address[]>}
 */
async function getAllowlistFromNumber(params) {
  const SIGNERS_START_INDEX = 3; // Skipping root, admin and beneficiary
  const signers = (await ethers.getSigners()).slice(
    SIGNERS_START_INDEX,
    params.numberOfAllowlist + SIGNERS_START_INDEX
  );
  const allowlist = signers.map((signer) => signer.address);
  return allowlist;
}

/**
 *
 * @param {AllowlistParams} params
 * @returns {Promise<AllowlistParams>}
 */
async function getAllowlistArrays(params = {}) {
  const allowlist = await getAllowlistFromNumber({ numberOfAllowlist: 7 });
  const classes = Array(allowlist.length).fill(0);

  const defaultParams = { allowlist: allowlist, classes: classes };
  params = { ...defaultParams, ...params };
  return params;
}

function getChangeClassParams(params) {
  if (!params.class) params.class = types.CLASS_DEFAULT;
  const classParams = getClassParamsFromType(params);
  return [params.class, ...classParams];
}

/**
 *
 * @param {{from?: SignerWithAddress, args?: []}} params
 * @returns {{from?: SignerWithAddress, args?: []}}
 */
function seedDeployParams(params) {
  return {
    from: params.from,
    args: params.args,
  };
}

/**
 * @param  {number} type
 * @param {DeployParams} params
 * @returns {Promise<any[] | SeedInitParams | Object | undefined>}
 */
async function getConvertedParams(type, params) {
  switch (type) {
    case types.SEED_INITIALIZE:
      return await seedInitParams(params);
    case types.SEEDFACTORY_DEPLOY_SEED:
      return await seedFactoryDeploySeedParams(params);
    case types.SEED_DEPLOY_INSTANCE:
    case types.SEEDFACTORY_DEPLOY_INSTANCE:
      return Promise.resolve(seedDeployParams(params));
    case types.SEED_CHANGE_CLASS:
      return Promise.resolve(getChangeClassParams(params));
    case types.SEED_ALLOWLIST:
      return await getAllowlistArrays(params);
    case types.SEED_ADD_CLASS_AND_WHITELIST_FROM_NUM:
      return Promise.resolve(getClassAndWhitelistParamsFromNumber(params));
    case types.SEED_ADD_CLASS_AND_WHITELIST:
      return Promise.resolve(getClassAndWhitelistParams(params));
    case types.SEED_TOKEN_PARAMS:
      return Promise.resolve(tokenParams());
    default:
      return;
  }
}

const tokenParams = () => [seedTokenParams, fundingTokenParams];

module.exports = {
  getConvertedParams,
};
