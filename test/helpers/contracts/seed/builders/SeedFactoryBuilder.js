//@ts-check
const { types } = require("../../../constants/constants");
const { ContractDeployer } = require("../../ContractDeployer");
/** @typedef {import("../../../../../lib/types/types").Contract} Contract */

/**
 * Deploys a new SeedFactory
 * @class
 */
class SeedFactoryBuilder {
  /**
   * @param {{args: []}} params
   * @returns {Promise<Contract | undefined>}
   */
  static async create(params) {
    return ContractDeployer.deploy(types.SEEDFACTORY_DEPLOY_INSTANCE, params);
  }
}

exports.SeedFactoryBuilder = SeedFactoryBuilder;
