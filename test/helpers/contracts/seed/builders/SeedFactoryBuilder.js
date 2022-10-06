const { types } = require("../../../types/types");
const contractDeployer = require("../../ContractDeployer");

class SeedFactoryBuilder {
  static async create(params) {
    return contractDeployer.ContractDeployer.deploy(
      types.SEEDFACTORY_DEPLOY_INSTANCE,
      params
    );
  }

  static async createInit(params) {
    const seedFactoryInstance = await this.create();
    return await seedFactoryInstance.setMasterCopy(params);
  }
}

exports.SeedFactoryBuilder = SeedFactoryBuilder;
