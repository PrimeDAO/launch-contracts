//@ts-check
const { ContractDeployer } = require("../../ContractDeployer");
/** @typedef {import("../../../../../lib/types/types").Contract} Contract */

/**
 * Deploys a new SeedFactory
 * @class
 */
class SeedFactoryBuilder {
  /**
   * @param {{args: []}} params
   * @param {number} seedFactoryType
   * @returns {Promise<Contract | undefined>}
   */
  static async create(params, seedFactoryType) {
    return ContractDeployer.deploy(seedFactoryType, params);
  }
}

exports.SeedFactoryBuilder = SeedFactoryBuilder;
