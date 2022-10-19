const { ethers } = require("hardhat");
const { getRootSigner } = require("../accounts/signers");
/**
 * @typedef {import(".../../../lib/types/types").SignerWithAddress} SignerWithAddress
 * @typedef {import("../../../lib/types/types").Contract} Contract
 */

/**
 *
 * @param {string} contract - "SeedFactory" | "Seed"
 * @param {{from: SignerWithAddress, args: any}} obj
 * @returns {Contract}
 */
async function deployContract(contract, { from, args = [] }) {
  if (!from) from = await getRootSigner();

  const factory = await ethers.getContractFactory(contract, from);

  const instance = await factory.deploy(...args);

  return instance.deployed();
}

module.exports = {
  deployContract,
};
