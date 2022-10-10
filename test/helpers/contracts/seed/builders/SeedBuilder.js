const contractDeployer = require("../../ContractDeployer");
const { types } = require("../../../constants/constants");

class SeedBuilder {
  constructor(instance) {
    this.instance = instance;
  }

  static async create(params) {
    return contractDeployer.ContractDeployer.deploy(
      types.SEED_DEPLOY_INSTANCE,
      params
    );
  }
  static async createInit(params) {
    const seedInstance = await this.create();
    return await seedInstance.initialize(params);
  }
}

module.exports = {
  SeedBuilder,
};
