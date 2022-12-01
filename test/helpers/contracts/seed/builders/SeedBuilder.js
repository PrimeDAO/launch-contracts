//@ts-check
const { ContractDeployer } = require("../../ContractDeployer");
const { types } = require("../../../constants/constants");
/** @typedef {import("../../../../../lib/types/types").Contract} Contract */

/**
 * Deploys a new Seed with different configuration
 * @class
 */
class SeedBuilder {
  /**
   * @param {*=} params
   * @returns {Promise<Contract | undefined>}
   */
  static async create(params) {
    const defaultInitParams = {
      from: undefined,
      args: undefined,
    };
    return await ContractDeployer.deploy(
      types.SEEDV2_DEPLOY_INSTANCE,
      params ?? defaultInitParams
    );
  }

  /**
   * @param {*=} params
   * @returns {Promise<Contract | undefined>}
   */
  static async createInit(params) {
    const seedInstance = await this.create(params);
    return await seedInstance.initialize(params);
  }
}

module.exports = {
  SeedBuilder,
};
