const { getConvertedParams } = require("../../params/constructParams");
const { paramTypes } = require("../../constants/constants");

class Seed {
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

  constructor(instance) {
    this.instance = instance;
  }

  async initialize(params) {
    const deployment = await getConvertedParams(paramTypes.SEED_INITIALIZE, params);
    await this.instance.initialize(...deployment);

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
    return this;
  }
}

module.exports = {
  Seed,
};
