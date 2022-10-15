const { ethers } = require("hardhat");

async function getNamedTestSigners() {
  const signers = await ethers.getSigners();

  return {
    root: signers[0],
    beneficiary: signers[1],
    admin: signers[2],
    buyer1: signers[3],
    buyer2: signers[4],
    buyer3: signers[5],
    buyer4: signers[6],
    buyer5: signers[7],
    buyer6: signers[8],
  };
}

async function getRootSigner() {
  return (await ethers.getSigners())[0];
}

async function fundSignersAndSeed(params) {
  const { root, admin, buyer1, buyer2 } = await getNamedTestSigners();
  if (!params.admin) params.admin = admin;
  if (!params.buyers) params.buyers = [buyer1, buyer2];
  if (!params.amounts)
    params.amounts = [
      params.Seed.getFundingAmount("100"),
      params.Seed.getFundingAmount("100"),
    ];

  const seedTokenInstance = params.Seed.seedTokenInstance;
  const fundingTokenInstance = params.Seed.fundingTokenInstance;
  const amount = params.Seed.seedAmountRequired;

  await params.Seed.seedTokenInstance
    .connect(root)
    .transfer(params.admin.address, amount);
  await seedTokenInstance
    .connect(params.admin)
    .transfer(params.Seed.instance.address, amount);

  for (let buyer = 0; buyer < params.buyers.length; buyer++) {
    await fundingTokenInstance
      .connect(root)
      .transfer(params.buyers[buyer].address, params.amounts[buyer]);
  }
}

module.exports = {
  getNamedTestSigners,
  getRootSigner,
  fundSignersAndSeed,
};
