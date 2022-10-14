const { SeedBuilder } = require("./contracts/seed/builders/SeedBuilder.js");
const {
  SeedFactoryBuilder,
} = require("./contracts/seed/builders/SeedFactoryBuilder.js");
const { fundSignersAndSeed } = require("./accounts/signers");

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

  const Seed_highNumClasses = await SeedBuilder.createInit();
  await Seed_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });
  await Seed_highNumClasses.addClassesAndAllowlists({
    numberOfRandomClasses: 100,
  });

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
    SeedFactory_initialized,
  };
}
module.exports = { launchFixture };
