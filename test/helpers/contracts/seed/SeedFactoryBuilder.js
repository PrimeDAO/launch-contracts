const { ethers } = require("hardhat");
const { convertParams } = require("../../params/constructParams");
const { types } = require("../../types/types");
const { getTokenAmount } = require("../../types/TypesConverter");
const {
  getRootSigner,
  getNamedTestSigners,
} = require("../../accounts/signers");

class SeedBuilder {
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

  constructor(instance) {
    this.instance = instance;
    return this;
  }

  static async create() {
    const params = {};

    return contractDeployer.ContractDeployer.deploy("SeedFactory", params);
  }
  getFundingAmount(amount) {
    return getTokenAmount(this.fundingTokenDecimal)(amount);
  }

  async initialize(params) {
    if (!params) params = {};
    if (!params.from) params.from = await getRootSigner();

    const deployment = await convertParams(types.SEED_INITIALIZE, params);
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

  async getSeedAmoundRequired() {
    return await this.instance.seedAmountRequired();
  }

  async close(params) {
    if (!params) params = {};
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).close();
    return this;
  }

  async pause(params) {
    if (!params) params = {};
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    await this.instance.connect(params.from).pause();
  }

  async changeClass(params) {
    if (!params) params = {};
    if (!params.from) params.from = await ethers.getSigner(this.admin);

    const changeClassParams = await convertParams(
      types.SEED_CHANGE_CLASS,
      params
    );

    this.classes[changeClassParams.class] = changeClassParams.slice(1);

    return await this.instance
      .connect(params.from)
      .changeClass(...changeClassParams);
  }

  async buy(params) {
    if (!params) params = {};
    if (!params.from) params.from = (await getNamedTestSigners()).buyer1;
    if (!params.fundingAmount)
      params.fundingAmount = this.getFundingAmount("10");

    await this.fundingTokenInstance
      .connect(params.from)
      .approve(this.instance.address, params.fundingAmount);

    await this.instance.connect(params.from).buy(params.fundingAmount);
  }
  async whitelist(params) {
    if (!params) params = {};
    if (!params.from) params.from = await ethers.getSigner(this.admin);
    if (!params.buyer) params.buyer = (await getNamedTestSigners()).buyer1;
    if (!params.class) params.class = 0; // Contributor Class
    await this.instance
      .connect(params.from)
      .whitelist(params.buyer.address, params.class);
  }
}

exports.SeedBuilder = SeedBuilder;
