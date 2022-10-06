const { task } = require("hardhat/config");
const { SeedArguments } = require("../lib/params/seed-test-args.json");

// Arguments for creating a Seed are taken from "../test/args/seed-test-args.json"
task("createSeed", "Creates a Seed directly, bypassing Gnosis safe").setAction(
  async (_, hre) => {
    try {
      console.log("Creating Seed...");
      const seedFactoryInstance = await hre.ethers.getContract("SeedFactory");
      const tx = await seedFactoryInstance.deploySeed(
        SeedArguments.BENEFICIARY,
        SeedArguments.ADMIN,
        [SeedArguments.TD2D, SeedArguments.TUSDC],
        [SeedArguments.softCap, SeedArguments.hardCap],
        SeedArguments.price,
        SeedArguments.startTime,
        SeedArguments.endTime,
        [SeedArguments.vestingDuration, SeedArguments.vestingCliff],
        SeedArguments.isPermissioned,
        SeedArguments.fee,
        SeedArguments.metadata
      );
      console.log(`Seed created through tx ${tx.hash}`);
      await tx.wait();
      console.log("Seed deployed");
    } catch (error) {
      console.log(error);
    }
  }
);

task("changeOwner", "changes owner of SeedFactory")
  .addParam("address", "new owner address", undefined)
  .setAction(async ({ address }, { ethers }) => {
    try {
      console.log(`changing owner of SeedFactory to ${address}`);
      const seedFactoryInstance = await ethers.getContract("SeedFactory");
      const tx = await seedFactoryInstance.transferOwnership(address);
      console.log("Transaction:", tx.hash);
    } catch (error) {
      console.log(error);
    }
  });
