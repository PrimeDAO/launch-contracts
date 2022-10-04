const { ethers } = require("hardhat");

async function getNamedTestSigners() {
  const signers = await ethers.getSigners();

  return {
    root: signers[0],
    beneficiary: signers[1],
    admin: signers[2],
    buyer1: signers[3],
    buyer2: signers[4],
  };
}

async function getRootSigner() {
  return (await ethers.getSigners())[0];
}

module.exports = {
  getNamedTestSigners,
  getRootSigner,
};
