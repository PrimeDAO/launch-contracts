// @ts-check
const { Seed } = require("./seed/Seed");
const { deployContract } = require("./contracts");
const { SeedFactory } = require("./seed/SeedFactory");
const { getConvertedParams } = require("../params/constructParams");
const { types, deploy } = require("../constants/constants");
/**
 * @typedef {import("../../../lib/types/types").ParamsType} ParamsType
 * @typedef {import("../../../lib/types/types").Contract} Contract
 * @typedef {import("../../../lib/types/types").DeployParams} DeployParams
 */

class ContractDeployer {
  /**
   * @param  {number} type
   * @param {DeployParams} params
   * @returns {Promise<Contract | undefined>}
   */
  static async deploy(type, params) {
    const { from, args } = await getConvertedParams(type, params);

    return await this._deploy(type, from, args);
  }

  /**
   *
   * @param {*} type
   * @param {*} from
   * @param {*} args
   * @returns {Promise<Contract | undefined>}
   */
  static async _deploy(type, from, args) {
    let instance;
    let builder;
    switch (type) {
      case types.SEEDV2_DEPLOY_INSTANCE:
        {
          instance = await deployContract(deploy.SEEDV2, { from, args });
          builder = new Seed(instance);
        }
        break;
      case types.SEEDFACTORYV2_DEPLOY_INSTANCE:
      case types.SEEDFACTORYV2NOACCESSCONTROL_DEPLOY_INSTANCE: {
        // get correct contract type
        const seedFactoryContractType =
          type == types.SEEDFACTORYV2_DEPLOY_INSTANCE
            ? deploy.SEEDFACTORYV2
            : deploy.SEEDFACTORYV2NOACCESSCONTROL;

        instance = await deployContract(seedFactoryContractType, {
          from,
          args,
        });
        builder = new SeedFactory(instance);
        builder.setOwner(await builder.instance.owner());
        break;
      }
      case "LBP":
        // ToDo: add this section when LBP gets added to repo
        break;
      default:
        return;
    }
    return builder;
  }
}

exports.ContractDeployer = ContractDeployer;
