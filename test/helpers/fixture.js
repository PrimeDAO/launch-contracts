const { ethers } = require("hardhat");
const { parseEther } = ethers.utils;
const { SeedBuilder } = require("./contracts/seed/builders/SeedBuilder.js");
const {
  SeedFactoryBuilder,
} = require("./contracts/seed/builders/SeedFactoryBuilder.js");
const { types } = require("./constants/constants");
const { fundSignersAndSeed } = require("./accounts/signers");
const { TEN_DAYS, TWENTY_DAYS } = require("./constants/time");

async function launchFixture() {
  const SeedV2_initialized = await SeedBuilder.createInit({
    from: undefined,
    args: undefined,
  });

  const SeedV2_funded = await SeedBuilder.createInit();
  await fundSignersAndSeed({
    Seed: SeedV2_funded,
  });

  const SeedV2_fundedPermissioned = await SeedBuilder.createInit({
    permissionedSeed: true,
  });
  await fundSignersAndSeed({
    Seed: SeedV2_fundedPermissioned,
  });

  const lowHardCapSeedParams = {
    softAndHardCaps: [
      SeedV2_funded.getFundingAmount("10"),
      SeedV2_funded.getFundingAmount("12"),
    ],
  };
  const SeedV2_fundedLowHardCap = await SeedBuilder.createInit(
    lowHardCapSeedParams
  );
  await fundSignersAndSeed({
    Seed: SeedV2_fundedLowHardCap,
  });
  const classesParams = {
    class1: {
      className: "contributors",
      classCap: SeedV2_fundedLowHardCap.getFundingAmount("9").toString(),
      individualCap: SeedV2_fundedLowHardCap.getFundingAmount("5").toString(),
      vestingCliff: TEN_DAYS.toNumber(),
      vestingDuration: TWENTY_DAYS.toNumber(),
      allowlist: [[]],
    },
  };
  await SeedV2_fundedLowHardCap.addClassesAndAllowlists({
    classesParameters: classesParams,
  });

  const SeedV2_highNumClasses = await SeedBuilder.createInit();
  await SeedV2_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });
  await SeedV2_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });

  // Tip has no cliff and short vesting period
  const shortTipVesting = {
    tip: [parseEther("0.02").toString(), 0, TEN_DAYS.toNumber()],
  };
  const SeedV2_shortTipVesting = await SeedBuilder.create();
  await SeedV2_shortTipVesting.initialize(shortTipVesting);
  await fundSignersAndSeed({ Seed: SeedV2_shortTipVesting });

  const SeedFactoryV2_initialized = await SeedFactoryBuilder.create(
    {
      args: [SeedV2_initialized.instance.address],
    },
    types.SEEDFACTORYV2_DEPLOY_INSTANCE
  );

  const SeedFactoryV2NoAccessControl_initialized =
    await SeedFactoryBuilder.create(
      {
        args: [SeedV2_initialized.instance.address],
      },
      types.SEEDFACTORYV2NOACCESSCONTROL_DEPLOY_INSTANCE
    );

  return {
    SeedV2_initialized,
    SeedV2_funded,
    SeedV2_fundedPermissioned,
    SeedV2_fundedLowHardCap,
    SeedV2_highNumClasses,
    SeedV2_shortTipVesting,
    SeedFactoryV2_initialized,
    SeedFactoryV2NoAccessControl_initialized,
  };
}
module.exports = { launchFixture };
