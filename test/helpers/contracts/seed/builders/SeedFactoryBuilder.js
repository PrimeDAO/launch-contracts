const { types } = require("../../../constants/constants");
const contractDeployer = require("../../ContractDeployer");

/**
 * @typedef {import("../../../types/types.js").SeedFactory} SeedFactory
 */

class SeedFactoryBuilder {
  /**
   * @param {*=} params
   * @returns {Promie<SeedFactory>}
   */
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
