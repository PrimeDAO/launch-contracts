const { SeedBuilder } = require("./SeedBuilder");
const { deployContract } = require("./contracts");

async function deploy(from) {
  //   console.log("here2");
  const instance = await _deploySeed(from);

  console.log("here5");
  const seed = new SeedBuilder(instance);
  console.log(seed.instance);

  return seed;
}
async function _deploySeed(from) {
  const args = [];
  //   console.log("here2.1");
  const instance = await deployContract("Seed", { args, from });
  console.log(instance.address);
  return instance;
}
module.exports = {
  SeedDeployer: { deploy },
};
