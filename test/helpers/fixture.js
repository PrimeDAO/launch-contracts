const { ethers } = require("hardhat");
const { parseEther } = ethers.utils;
const { SeedBuilder } = require("./contracts/seed/builders/SeedBuilder.js");
const {
  SeedFactoryBuilder,
} = require("./contracts/seed/builders/SeedFactoryBuilder.js");
const { fundSignersAndSeed } = require("./accounts/signers");
const { TEN_DAYS, TWENTY_DAYS } = require("./constants/time");

async function launchFixture() {
  const Seed_initialized = await SeedBuilder.createInit();

  const Seed_funded = await SeedBuilder.createInit();
  await fundSignersAndSeed({
    Seed: Seed_funded,
  });

  const Seed_fundedPermissioned = await SeedBuilder.createInit({
    permissionedSeed: true,
  });
  await fundSignersAndSeed({
    Seed: Seed_fundedPermissioned,
  });

  const lowHardCapSeedParams = {
    softAndHardCaps: [
      Seed_funded.getFundingAmount("10"),
      Seed_funded.getFundingAmount("12"),
    ],
  };
  const Seed_fundedLowHardCap = await SeedBuilder.createInit(
    lowHardCapSeedParams
  );
  await fundSignersAndSeed({
    Seed: Seed_fundedLowHardCap,
  });
  const classesParams = {
    class1: {
      className: "contributors",
      classCap: Seed_fundedLowHardCap.getFundingAmount("9").toString(),
      individualCap: Seed_fundedLowHardCap.getFundingAmount("5").toString(),
      vestingCliff: TEN_DAYS.toNumber(),
      vestingDuration: TWENTY_DAYS.toNumber(),
      allowlist: [[]],
    },
  };
  await Seed_fundedLowHardCap.addClassesAndAllowlists({
    classesParameters: classesParams,
  });

  const Seed_highNumClasses = await SeedBuilder.createInit();
  await Seed_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });
  await Seed_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });

  // Tip has no cliff and short vesting period
  const shortTipVesting = {
    tip: [parseEther("0.02").toString(), 0, TEN_DAYS.toNumber()],
  };
  const Seed_shortTipVesting = await SeedBuilder.create();
  await Seed_shortTipVesting.initialize(shortTipVesting);
  await fundSignersAndSeed({ Seed: Seed_shortTipVesting });

  const SeedFactory_deployed = await SeedFactoryBuilder.create();

  const SeedFactory_initialized = await SeedFactoryBuilder.createInit({
    seedAddress: Seed_initialized.instance.address,
  });

  return {
    Seed_initialized,
    SeedFactory_deployed,
    Seed_funded,
    Seed_fundedPermissioned,
    Seed_fundedLowHardCap,
    Seed_highNumClasses,
    Seed_shortTipVesting,
    SeedFactory_initialized,
  };
}
module.exports = { launchFixture };
