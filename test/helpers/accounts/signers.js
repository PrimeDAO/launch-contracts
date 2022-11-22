const { ethers } = require("hardhat");
/** @typedef {import("../../../lib/types/types").Address} Address */
/** @typedef {import("../../../lib/types/types").BigNumber} BigNumber */
/** @typedef {import("../../../lib/types/types").Seed} Seed */

async function getNamedTestSigners() {
  const signers = await ethers.getSigners();

  return {
    root: signers[0],
    beneficiary: signers[1],
    admin: signers[2],
    treasury: signers[3],
    buyer1: signers[4],
    buyer2: signers[5],
    buyer3: signers[6],
    buyer4: signers[7],
    buyer5: signers[8],
    buyer6: signers[9],
  };
}

async function getRootSigner() {
  return (await ethers.getSigners())[0];
}

/**
 *
 * @param {{Seed: Seed, admin?: Address, buyers?: Address[],
 *          fundingTokenAmounts?: BigNumber[] | string[],
 *          seedAmountRequired?: BigNumber[] | string[]}} params
 */
async function fundSignersAndSeed(params) {
  const { root, admin, buyer1, buyer2 } = await getNamedTestSigners();
  if (!params.admin) params.admin = admin;
  if (!params.buyers) params.buyers = [buyer1, buyer2];
  if (!params.fundingTokenAmounts)
    params.fundingTokenAmounts = [
      params.Seed.getFundingAmount("100"),
      params.Seed.getFundingAmount("100"),
    ];
  if (!params.seedAmountRequired)
    params.seedAmountRequired = params.Seed.seedAmountRequired;

  const seedTokenInstance = params.Seed.seedTokenInstance;
  const fundingTokenInstance = params.Seed.fundingTokenInstance;

  await params.Seed.seedTokenInstance
    .connect(root)
    .transfer(params.admin.address, params.seedAmountRequired);
  await seedTokenInstance
    .connect(params.admin)
    .transfer(params.Seed.instance.address, params.seedAmountRequired);

  for (let buyer = 0; buyer < params.buyers.length; buyer++) {
    await fundingTokenInstance
      .connect(root)
      .transfer(
        params.buyers[buyer].address,
        params.fundingTokenAmounts[buyer]
      );
  }
}

module.exports = {
  getNamedTestSigners,
  getRootSigner,
  fundSignersAndSeed,
};
