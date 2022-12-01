const { ethers } = require("hardhat");
const { getConvertedParams } = require("../../params/constructParams");
const { types, PRECISION, EMPTY32BYTES } = require("../../constants/constants");
const { getTokenAmount } = require("../../constants/TypesConverter");
const {
  getRootSigner,
  getNamedTestSigners,
} = require("../../accounts/signers");
const { BigNumber } = require("ethers");

/**
 * @typedef {import("../../../../lib/types/types").ContributorClassParams} ContributorClassParams
 * @typedef {import("../../../../lib/types/types").ChangeClassAndAllowlistParams} ChangeClassAndAllowlistParams
 * @typedef {import("../../../../lib/types/types").SignerWithAddress} SignerWithAddress
 * @typedef {import("../../../../lib/types/types").FunderPortfolio} FunderPortfolio
 * @typedef {import("../../../../lib/types/types").Contract} Contract
 * @typedef {import("../../../../lib/types/types").Address} Address
 */

class Seed {
  instance;
  beneficiary;
  admin;
  treasury;
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

  /**
   *
   * @param {Address} address
   * @returns {Promise<FunderPortfolio>}
   */
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

  async getClosedStatus() {
    return await this.instance.closed();
  }

  async getPausedStatus() {
    return await this.instance.paused();
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

  async getTotalSeedDistributed() {
    return await this.instance.totalSeedDistributed();
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
    return contractDeployer.ContractDeployer.deploy("SeedFactoryV2", params);
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
   * @dev The TotalBuyableSeed is calculated inside the Seed.initialize() function
   * @returns {BigNumber}
   */
  calculateTotalBuyableSeed() {
    return BigNumber.from(this.hardCap)
      .mul(BigNumber.from(PRECISION))
      .div(BigNumber.from(this.price));
  }

  /**
   * @dev The tipAmount is calculated inside the Seed.initialize() function
   * @returns {BigNumber}
   */
  calculateTipAmount() {
    return BigNumber.from(this.calculateTotalBuyableSeed())
      .mul(BigNumber.from(this.tipPercentage))
      .div(PRECISION);
  }

  /**
   *
   * @dev See calculation in Seed.sol -> function retireveSeedTokens() for reference
   * @param {{softCap:boolean}} params
   * @returns {Promise<BigNumber>}
   */
  async calculateRetrieveSeedAmount(params) {
    const tip = await this.getTip();
    if (!params.softCap) {
      return BigNumber.from(
        await this.seedTokenInstance.balanceOf(this.instance.address)
      ).sub(
        BigNumber.from(tip.tipAmount).sub(BigNumber.from(tip.totalClaimed))
      );
    } else {
      const totalSeedDistributed = BigNumber.from(
        this.calculateTotalBuyableSeed()
      ).sub(BigNumber.from(await this.getSeedRemainder()));
      const totalDistributedMinClaimed = totalSeedDistributed.sub(
        BigNumber.from(await this.getSeedClaimed())
      );
      const tipAmountMinClaimed = BigNumber.from(tip.tipAmount).sub(
        BigNumber.from(tip.totalClaimed)
      );
      return BigNumber.from(
        await this.seedTokenInstance.balanceOf(this.instance.address)
      )
        .sub(totalDistributedMinClaimed)
        .sub(tipAmountMinClaimed);
    }
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

    const deployment = await getConvertedParams(
      types.SEEDV2_INITIALIZE,
      params
    );
    this.seedTokenInstance = deployment[0][0];
    this.fundingTokenInstance = deployment[0][1];
    this.fundingTokenDecimal = await this.fundingTokenInstance.decimals();
    this.seedTokenDecimal = await this.seedTokenInstance.decimals();
    deployment.shift();

    await this.instance.connect(params.from).initialize(...deployment);

    this.beneficiary = deployment[0];
    this.admin = deployment[1][0];
    this.treasury = deployment[1][1];
    this.seedTokenAddress = deployment[2][0];
    this.fundingTokenAddress = deployment[2][1];
    this.softCap = deployment[3][0];
    this.hardCap = deployment[3][1];
    this.price = deployment[4];
    this.startTime = deployment[5][0];
    this.endTime = deployment[5][1];
    this.classes.push([EMPTY32BYTES, ...deployment[6]]);
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
   *
   * @param {{from?: SignerWithAddress}} params
   */
  async unpause(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).unpause();
  }

  /**
   * @param {{from?: SignerWithAddress,
   *          classesParameters?: {class1?: ChangeClassAndAllowlistParams,
   *          class2?: ChangeClassAndAllowlistParams, class3?: ChangeClassAndAllowlistParams}
   *        }} params
   */
  async changeClassesAndAllowlists(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    const changeClassesAndAllowlistsParams = await getConvertedParams(
      types.SEEDV2_CHANGE_CLASSES_AND_ALLOWLISTS,
      params
    );

    for (let i = 0; i < changeClassesAndAllowlistsParams[0].length; i++) {
      const classParams = [
        changeClassesAndAllowlistsParams[1][i],
        changeClassesAndAllowlistsParams[2][i],
        changeClassesAndAllowlistsParams[3][i],
        changeClassesAndAllowlistsParams[4][i],
        changeClassesAndAllowlistsParams[5][i],
      ];
      this.classes[changeClassesAndAllowlistsParams[0][i]] = classParams;
    }

    return await this.instance
      .connect(params.from)
      .changeClassesAndAllowlists(...changeClassesAndAllowlistsParams);
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
   *          classesParameters?: {class1?: ContributorClassParams,
   *          class2?: ContributorClassParams, class3?: ContributorClassParams}
   *        }} params
   */
  async addClassesAndAllowlists(params = {}) {
    let functionParams;
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    if (params.numberOfRandomClasses) {
      functionParams = await getConvertedParams(
        types.SEEDV2_ADD_CLASS_AND_WHITELIST_FROM_NUM,
        params
      );
    } else {
      functionParams = await getConvertedParams(
        types.SEEDV2_ADD_CLASS_AND_WHITELIST,
        params
      );
    }
    for (let i = 0; i < functionParams.length; i++) {
      const classParams = [
        functionParams[0][i],
        functionParams[1][i],
        functionParams[2][i],
        functionParams[3][i],
        functionParams[4][i],
      ];
      this.classes.push(classParams);
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
    return await this.instance.connect(params.from).claim(params.claimAmount);
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

  async getAllClasses() {
    return await this.instance.callStatic.getAllClasses();
  }

  /**
   *
   * @param {{from?: Address}} params
   */
  async retrieveSeedTokens(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).retrieveSeedTokens();
  }

  /**
   *
   * @param {{from?: SignerWithAddress}} params
   */
  async withdraw(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).withdraw();
  }

  /**
   *
   * @param {{from?: SignerWithAddress, allowlistAddress?: Address}} params
   */
  async unAllowlist(params = {}) {
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    if (!params.allowlistAddress)
      params.allowlistAddress = (await getNamedTestSigners()).buyer1.address;
    await this.instance
      .connect(params.from)
      .unAllowlist(params.allowlistAddress);
  }

  /**
   *
   * @param {{from?: SignerWithAddress}} params
   */
  async retrieveFundingTokens(params = {}) {
    if (!params.from) params.from = (await getNamedTestSigners()).buyer1;
    return await this.instance.connect(params.from).retrieveFundingTokens();
  }
}

module.exports = {
  Seed,
};
