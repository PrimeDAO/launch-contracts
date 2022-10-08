// @ts-check
const { Seed } = require("./seed/Seed");
const { deployContract } = require("./contracts");
const seedFactory = require("./seed/SeedFactory");
const { getConvertedParams } = require("../params/constructParams");
const { types, deploy } = require("../constants/constants");

class ContractDeployer {
  static async deploy(type, params) {
    const { from, args } = getConvertedParams(type, params);

    return await this._deploy(type, from, args);
  }

  static async _deploy(type, from, args) {
    let instance, builder;
    switch (type) {
      case types.SEED_DEPLOY_INSTANCE:
        {
          instance = await deployContract(deploy.SEED, { from, args });
          builder = new Seed(instance);
        }
        break;
      case types.SEEDFACTORY_DEPLOY_INSTANCE: {
        instance = await deployContract(deploy.SEEDFACTORY, { from, args });
        builder = new seedFactory.SeedFactory(instance);
        builder.setOwner(await builder.instance.owner());
        break;
      }
      case "LBP":
        // ToDo: add this section when LBP gets added to repo
        break;
    }
    return builder;
  }
}

exports.ContractDeployer = ContractDeployer;
