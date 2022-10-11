const { ethers } = require("hardhat");
const { getRootSigner } = require("../accounts/signers");

async function deployContract(contract, { from, args }) {
  if (!args) args = [];
  if (!from) from = await getRootSigner();

  const factory = await ethers.getContractFactory(contract, from);

  const instance = await factory.deploy(...args);

  return instance.deployed();
}

module.exports = {
  deployContract,
};
