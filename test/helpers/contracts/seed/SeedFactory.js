const { getConvertedParams, tokenParams } = require("../../params/constructParams");
const { getRootSigner } = require("../../accounts/signers");
const { types } = require("../../constants/constants");
const { getERC20TokenInstances } = require("../tokens/tokens");

/** @typedef {import("../../types/types.js").TestParams} TestParams */

class SeedFactory {
  owner;
  instance;
  beneficiary;
  admin;
  tokenAddresses;
  softAndHardCap;
  price;
  startAndEndTime;
  defaultClassParameters;
  permissionedSeed;
  allowlist;
  tipping;
  metadata;
  tokenInstances;

  constructor(instance) {
    this.instance = instance;
    return this;
  }

  async setOwner(owner) {
    this.owner = owner;
  }

  /**
   * @param {TestParams} params
   */
  async setMasterCopy(params) {
    if (!params) params = {};
    if (!params.from) params.from = await getRootSigner();

    await this.instance.connect(params.from).setMasterCopy(params.seedAddress);
    return this;
  }

  /**
   * @param {TestParams} params
   */
  async transferOwnership(params) {
    if (!params.from) params.from = await getRootSigner();

    await this.instance.connect(params.from).transferOwnership(params.newOwner);
    this.setOwner(await this.instance.owner());
    return this;
  }

  /**
   * @param {TestParams} params
   */
  async deploySeed(params) {
    if (!params) params = {};
    if (!params.from) params.from = await getRootSigner();
    if (!params.tokenInstances)
      params.tokenInstances = await getERC20TokenInstances(tokenParams());

    this.tokenInstances = params.tokenInstances;

    const deployment = await getConvertedParams(
      types.SEEDFACTORY_DEPLOY_SEED,
      params
    );

    this.admin = deployment[0];
    this.beneficiary = deployment[1];
    this.tokenAddresses = deployment[2];
    this.softAndHardCap = deployment[3];
    this.price = deployment[4];
    this.startAndEndTime = deployment[5];
    this.defaultClassParameters = deployment[6];
    this.permissionedSeed = deployment[7];
    this.allowlist = deployment[8];
    this.tipping = deployment[9];
    this.metadata = deployment[10];
    return this.instance.deploySeed(...deployment);
  }
}

exports.SeedFactory = SeedFactory;
