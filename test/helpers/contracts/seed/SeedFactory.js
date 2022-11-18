const { getConvertedParams } = require("../../params/constructParams");
const { getRootSigner } = require("../../accounts/signers");
const { types } = require("../../constants/constants");

class SeedFactory {
  owner;
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
  metadata;

  /** @constructor */
  constructor(instance) {
    this.instance = instance;
    return this;
  }

  async setOwner(owner) {
    this.owner = owner;
  }

  async setMasterCopy(params = {}) {
    if (!params.from) params.from = await getRootSigner();

    await this.instance.connect(params.from).setMasterCopy(params.seedAddress);
    return this;
  }

  /**
   * @param {{from?: string, newOwner: string}} params
   */
  async transferOwnership(params) {
    if (!params.from) params.from = await getRootSigner();

    await this.instance.connect(params.from).transferOwnership(params.newOwner);
    this.setOwner(await this.instance.owner());
    return this;
  }

  async deploySeed(params = {}) {
    if (!params.from) params.from = await getRootSigner();

    const deployment = await getConvertedParams(
      types.SEEDFACTORY_DEPLOY_SEED,
      params
    );
    this.seedTokenInstance = deployment[0][0];
    this.fundingTokenInstance = deployment[0][1];
    deployment.shift();

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
    this.classes.push(deployment[6]);
    this.permissionedSeed = deployment[7];
    this.allowlist = deployment[8];
    this.tipPercentage = deployment[9][0];
    this.tipVestingCliff = deployment[9][1];
    this.tipVestingDuration = deployment[9][2];
    this.metadata = deployment[10];

    return this.instance.connect(params.from).deploySeed(...deployment);
  }
}

exports.SeedFactory = SeedFactory;
