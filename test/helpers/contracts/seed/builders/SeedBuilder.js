// @ts-check
const contractDeployer = require("../../ContractDeployer");
const { types } = require("../../../constants/constants");

/**
 * @typedef {import("../../../types/types.js").Seed} Seed
 */

class SeedBuilder {
  constructor(instance) {
    this.instance = instance;
  }

  /**
   * @param {*=} params
   * @returns {Promise<Seed>}
   */
  static async create(params) {
    return contractDeployer.ContractDeployer.deploy(
      types.SEED_DEPLOY_INSTANCE,
      params
    );
  }
  static async createInit(params) {
    const seedInstance = await this.create(params);
    return await seedInstance.initialize(params);
  }
}

module.exports = {
  SeedBuilder,
};
