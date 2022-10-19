// This file is used to construct the arguments to verify the SignerV2 contract.

const { ethers } = require("hardhat");
const { getSafeAddress } = require("../safeAddresses");

async function getFactories() {
  const seedFactoryInstance = await ethers.getContractAt("SeedFactory");
  const lbpManagerFactoryInstance = await ethers.getContractAt(
    "LBPManagerFactory"
  );

  return {
    seedFactoryInstance: seedFactoryInstance,
    lbpManagerFactoryInstance: lbpManagerFactoryInstance,
  };
}

async function getFunctionSelectors() {
  const factories = await getFactories();
  const deployLBPManagerFunctionSignature =
    factories.lbpManagerFactoryInstance.interface.getSighash(
      "deployLBPManager"
    );

  const deploySeedFunctionSignature =
    factories.seedFactoryInstance.interface.getSighash("deploySeed");

  return [deploySeedFunctionSignature, deployLBPManagerFunctionSignature];
}

async function getSeedAndLBPFactoriesAddresses() {
  const factories = await getFactories();
  return [
    factories.seedFactoryInstance.address,
    factories.lbpManagerFactoryInstance.address,
  ];
}

module.exports = [
  getSafeAddress(),
  getSeedAndLBPFactoriesAddresses(),
  getFunctionSelectors(),
];
