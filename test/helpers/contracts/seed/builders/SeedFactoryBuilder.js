const { types } = require("../../../constants/constants");
const contractDeployer = require("../../ContractDeployer");

class SeedFactoryBuilder {
  static async create(params) {
    return contractDeployer.ContractDeployer.deploy(
      types.SEEDFACTORY_DEPLOY_INSTANCE,
      params
    );
  }

  static async createInit(params) {
    const seedFactoryInstance = await this.create(params);
    return await seedFactoryInstance.setMasterCopy(params);
  }
}

exports.SeedFactoryBuilder = SeedFactoryBuilder;
