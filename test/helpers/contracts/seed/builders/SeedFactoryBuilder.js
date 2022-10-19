//@ts-check
const { types } = require("../../../constants/constants");
const { ContractDeployer } = require("../../ContractDeployer");
/** @typedef {import("../../../../../lib/types/types").Contract} Contract */

/**
 * Deploys a new SeedFactory with different configuration
 * @class
 */
class SeedFactoryBuilder {
  /**
   * @param {*=} params
   * @returns {Promise<Contract | undefined>}
   */
  static async create(params) {
    return ContractDeployer.deploy(types.SEEDFACTORY_DEPLOY_INSTANCE, params);
  }

  /**
   * @param {*=} params
   * @returns {Promise<Contract | undefined>}
   */
  static async createInit(params) {
    const seedFactoryInstance = await this.create();
    return await seedFactoryInstance.setMasterCopy(params);
  }
}

exports.SeedFactoryBuilder = SeedFactoryBuilder;
