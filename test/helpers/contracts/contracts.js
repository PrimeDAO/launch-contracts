const { ethers } = require("hardhat");
const { getRootSigner } = require("../accounts/signers");
/**
 * @typedef {import(".../../../lib/types/types").SignerWithAddress} SignerWithAddress
 * @typedef {import("../../../lib/types/types").Contract} Contract
 */

/**
 *
 * @param {string} contract - "SeedFactoryV2" | "SeedV2"
 * @param {{from: SignerWithAddress, args: any}} obj
 * @returns {Promise<Contract>}
 */
async function deployContract(contract, { from, args }) {
  if (!from) from = await getRootSigner();
  if (!args) args = [];

  const factory = await ethers.getContractFactory(contract, from);

  const instance = await factory.deploy(...args);

  return instance.deployed();
}

module.exports = {
  deployContract,
};
