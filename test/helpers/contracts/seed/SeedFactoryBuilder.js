const contractDeployer = require("../ContractDeployer");
const { convertSeedParams } = require("../../params/constructParams");

class SeedBuilder {
  instance;
  beneficiary;
  admin;
  tokens;
  softAndHardCap;
  price;
  startAndEndTime;
  defaultClassParameters;
  permissionedSeed;
  allowlist;
  tipping;
  metadata;

  constructor(instance) {
    this.instance = instance;
    return this;
  }

  static async create() {
    const params = {};

    return contractDeployer.ContractDeployer.deploy("SeedFactory", params);
  }

  async deploySeed(params) {
    const deployment = await convertParams("SeedFacotry", params);
    await this.instance.deploySeed(...deployment);

    this.admin = deployment[0];
    this.beneficiary = deployment[1];
    this.tokens = deployment[2];
    this.softAndHardCap = deployment[3];
    this.price = deployment[4];
    this.startAndEndTime = deployment[5];
    this.defaultClassParameters = deployment[6];
    this.permissionedSeed = deployment[7];
    this.allowlist = deployment[8];
    this.tipping = deployment[9];
    this.metadata = deployment[10];
    return this;
  }
}

exports.SeedBuilder = SeedBuilder;
