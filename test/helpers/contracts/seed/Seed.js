const { ethers } = require("hardhat");
const { getConvertedParams } = require("../../params/constructParams");
const { types, PRECISION } = require("../../constants/constants");
const { getTokenAmount } = require("../../constants/TypesConverter");
const {
  getRootSigner,
  getNamedTestSigners,
} = require("../../accounts/signers");
const { BigNumber } = require("ethers");

/**
 * @typedef {import("../../types/types").SignerWithAddress} SignerWithAddress
 * @typedef {import("../../types/types").Address} Address
 * @typedef {import("../../types/types").Contract} Contract
 */

class Seed {
  instance;
  beneficiary;
  admin;
  seedTokenAddress;
  fundingTokenAddress;
  softCap;
  hardCap;
  startTime;
  endTime;
  tipPercentage;
  tipVestingCliff;
  tipVestingDuration;
  seedTokenInstance;
  fundingTokenInstance;
  price;
  classes = [];
  permissionedSeed;
  allowlist;
  seedAmountRequired;
  fundingTokenDecimal;
  seedTokenDecimal;

  /** @constructor */
  constructor(instance) {
    this.instance = instance;
  }

  async getFunder(address) {
    return await this.instance.funders(address);
  }

  async getSeedRemainder() {
    return await this.instance.seedRemainder();
  }

  async getFundingCollected() {
    return await this.instance.fundingCollected();
  }

  async getSeedAmountRequired() {
    return await this.instance.seedAmountRequired();
  }

  async getIsFunded() {
    return await this.instance.isFunded();
  }

  async getVestingStartTime() {
    return await this.instance.vestingStartTime();
  }

  async getMinimumReached() {
    return await this.instance.minimumReached();
  }

  async getMaximumReached() {
    return await this.instance.maximumReached();
  }

  async getTotalFunderCount() {
    return await this.instance.totalFunderCount();
  }

  async getSeedClaimed() {
    return await this.instance.seedClaimed();
  }

  async getFundingWithdrawn() {
    return await this.instance.fundingWithdrawn();
  }

  async getTip() {
    return await this.instance.tip();
  }

  async getClass(classId) {
    return await this.instance.classes(classId);
  }

  static async create(params = {}) {
    return contractDeployer.ContractDeployer.deploy("SeedFactory", params);
  }

  /**
   *
   * @returns {Promise<BigNumber>}
   */
  async getSeedAmoundRequired() {
    return await this.instance.seedAmountRequired();
  }

  /**
   * @param {string} amount
   * @returns {BigNumber}
   */
  getFundingAmount(amount) {
    return getTokenAmount(this.fundingTokenDecimal)(amount);
  }

  /**
   * @param {string} amount
   * @returns {BigNumber}
   */
  getSeedAmount(amount) {
    return getTokenAmount(this.seedTokenDecimal)(amount);
  }

  /**
   * @param {string | BigNumber} fundingAmount
   * @returns {BigNumber}
   */
  getSeedAmountFromFundingAmount(fundingAmount) {
    return BigNumber.from(fundingAmount)
      .div(BigNumber.from(this.price))
      .mul(BigNumber.from(PRECISION.toString()));
  }
  /**
   *
   * @param {{from?: SignerWithAddress,
   *          tokensInstances?: Contract[],
   *          beneficiary?: Address,
   *          admin?: Address,
   *          tokenAddresses? : Address[],
   *          softAndHardCap?: BigNumber[] | string[],
   *          defaultClassParameters?: [BigNumber | string, number, number],
   *          permissionedSeed?: boolean,
   *          allowlist?: Address[],
   *          tip?: [BigNumber | string, number, number]
   *         }} params
   * @returns {Promise<this>}
   */
  async initialize(params = {}) {
    if (!params.from) params.from = await getRootSigner();

    const deployment = await getConvertedParams(types.SEED_INITIALIZE, params);
    this.seedTokenInstance = deployment[0][0];
    this.fundingTokenInstance = deployment[0][1];
    this.fundingTokenDecimal = await this.fundingTokenInstance.decimals();
    this.seedTokenDecimal = await this.seedTokenInstance.decimals();
    deployment.shift();

    await this.instance.connect(params.from).initialize(...deployment);

    this.beneficiary = deployment[0];
    this.admin = deployment[1];
    this.seedTokenAddress = deployment[2][0];
    this.fundingTokenAddress = deployment[2][1];
    this.softCap = deployment[3][0];
    this.hardCap = deployment[3][1];
    this.price = deployment[4];
    this.startTime = deployment[5][0];
    this.endTime = deployment[5][1];
    this.classes.push(deployment[6]);
    this.permissionedSeed = deployment[7];
    this.allowlist = deployment[8];
    this.tipPercentage = deployment[9][0];
    this.tipVestingCliff = deployment[9][1];
    this.tipVestingDuration = deployment[9][2];
    this.seedAmountRequired = (await this.getSeedAmoundRequired()).toString();

    return this;
  }

  /**
   * @param {{from?: SignerWithAddress}} params
   */
  async close(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).close();
    return this;
  }

  /**
   * @param {{from?: SignerWithAddress}} params
   */
  async pause(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).pause();
  }

  /**
   * @param {{from?: SignerWithAddress,
   *          class?: number,
   *          className?: string,
   *          classCap?: string | BigNumber,
   *          individualCap?: string | BigNumber,
   *          vestingCliff?: number
   *          vestingDuration?: number
   *        }} params
   */
  async changeClass(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);

    const changeClassParams = await getConvertedParams(
      types.SEED_CHANGE_CLASS,
      params
    );

    this.classes[changeClassParams.class] = changeClassParams.slice(1);

    return await this.instance
      .connect(params.from)
      .changeClass(...changeClassParams);
  }

  /**
   * @param {{from?: SignerWithAddress, fundingAmount?: string | BigNumber}} params
   */
  async buy(params = {}) {
    if (!params.from) params.from = (await getNamedTestSigners()).buyer1;
    if (!params.fundingAmount)
      params.fundingAmount = this.getFundingAmount("10");

    await this.fundingTokenInstance
      .connect(params.from)
      .approve(this.instance.address, params.fundingAmount);

    return await this.instance.connect(params.from).buy(params.fundingAmount);
  }

  /**
   * @param {{from?: SignerWithAddress,
   *          numberOfRandomClasses?: number,
   *          classesParameters?: {class1?: {}, class2?: {}, class3?: {}}
   *        }} params
   */
  async addClassesAndAllowlists(params = {}) {
    let functionParams;
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    if (params.numberOfRandomClasses) {
      functionParams = await getConvertedParams(
        types.SEED_ADD_CLASS_AND_WHITELIST_FROM_NUM,
        params
      );
    } else {
      functionParams = await getConvertedParams(
        types.SEED_ADD_CLASS_AND_WHITELIST,
        params
      );
    }

    await this.instance
      .connect(params.from)
      .addClassesAndAllowlists(...functionParams);
  }

  /**
   * @param {{from?: SignerWithAddress, allowlist?: Address[], classes?: number[]}} params
   */
  async setAllowlist(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    if (!params.allowlist)
      params.allowlist = [(await getNamedTestSigners()).buyer1.address];
    if (!params.classes) params.classes = [0]; // Contributor Class

    await this.instance
      .connect(params.from)
      .allowlist(params.allowlist, params.classes);
  }

  /**
   * @param {{from?: SignerWithAddress, claimAmount?: string | BigNumber}} params
   */
  async claim(params = {}) {
    if (!params.from) params.from = (await getNamedTestSigners()).buyer1;
    if (!params.claimAmount)
      params.claimAmount = await this.calculateClaimFunder(params);
    return await this.instance.claim(params.from.address, params.claimAmount);
  }

  /**
   * @param {{from?: SignerWithAddress}} params
   */
  async claimTip(params = {}) {
    if (!params.from) params.from = await getRootSigner();
    return await this.instance.connect(params.from).claimTip();
  }

  /**
   * @param {{from?: SignerWithAddress}} params
   */
  async calculateClaimFunder(params = {}) {
    if (!params.from) params.from = (await getNamedTestSigners()).buyer1;
    return await this.instance.callStatic.calculateClaimFunder(
      params.from.address
    );
  }

  async calculateClaimBeneficiary() {
    return await this.instance.callStatic.calculateClaimBeneficiary();
  }
}

module.exports = {
  Seed,
};
