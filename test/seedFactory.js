const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const {
  utils: { parseEther },
  constants: { AddressZero },
} = ethers;

const { loadFixture } = waffle;
const { launchFixture } = require("./fixtures.js");

describe("> Contract: SeedFactory", () => {
  let uninitializedSeedFactoryInstance,
    initializedSeedFactoryInstance,
    uninitializedSeedInstance,
    SeedFactory,
    seedFactoryArgs,
    root,
    beneficiary,
    admin,
    seedTokenInstance,
    fundingTokenInstance,
    softCap,
    hardCap,
    price,
    startTime,
    endTime,
    defaultClassParameters,
    permissioned,
    whitelistAddresses,
    tipping,
    metadata,
    getFundingAmounts;
  beforeEach(async () => {
    ({
      uninitializedSeedFactoryInstance,
      initializedSeedFactoryInstance,
      uninitializedSeedInstance,
      SeedFactory,
      seedFactoryArgs,
      root,
      beneficiary,
      admin,
      seedTokenInstance,
      fundingTokenInstance,
      softCap,
      hardCap,
      price,
      startTime,
      endTime,
      defaultClassParameters,
      permissioned,
      whitelistAddresses,
      tipping,
      metadata,
      getFundingAmounts,
    } = await loadFixture(launchFixture));
  });
  describe("$ Function: transferOwnership()", () => {
    describe("# given the SeedFactory has been deployed", () => {
      describe("» when calling function transferOwnership()", () => {
        it("should revert if caller is not the owner", async () => {
          await expect(
            initializedSeedFactoryInstance
              .connect(beneficiary)
              .transferOwnership(root.address)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should revert if address is equal to zero", async () => {
          await expect(
            initializedSeedFactoryInstance.transferOwnership(AddressZero)
          ).to.be.revertedWith("Ownable: new owner is the zero address");
        });
        it("should succees if caller is the owner", async () => {
          expect(await initializedSeedFactoryInstance.owner()).to.equal(
            root.address
          );
          await initializedSeedFactoryInstance.transferOwnership(
            beneficiary.address
          );
          expect(await initializedSeedFactoryInstance.owner()).to.equal(
            beneficiary.address
          );
        });
      });
    });
  });
  describe("$ Function: setMasterCopy()", () => {
    describe("# given Seed master copy is not yet set", () => {
      describe("» when calling function setMasterCopy()", () => {
        it("should fail if Seed address is equal to SeedFactory address", async () => {
          await expect(
            uninitializedSeedFactoryInstance
              .connect(root)
              .setMasterCopy(uninitializedSeedFactoryInstance.address)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should fail if Seed address is equal zero", async () => {
          await expect(
            uninitializedSeedFactoryInstance
              .connect(root)
              .setMasterCopy(AddressZero)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should succeed in setting master copy", async () => {
          expect(await uninitializedSeedFactoryInstance.masterCopy()).to.equal(
            AddressZero
          );

          await expect(
            uninitializedSeedFactoryInstance
              .connect(root)
              .setMasterCopy(uninitializedSeedInstance.address)
          ).to.not.be.reverted;
          expect(await uninitializedSeedFactoryInstance.masterCopy()).to.equal(
            uninitializedSeedInstance.address
          );
        });
      });
    });
  });
  describe("$ Function: deploySeed()", () => {
    describe("# given Seed Mastecopy is not set", () => {
      describe("» when calling function deploySeed()", () => {
        it("should revert", async () => {
          await expect(
            uninitializedSeedFactoryInstance.deploySeed(...seedFactoryArgs)
          ).to.be.revertedWith("SeedFactory: mastercopy has not been set");
        });
      });
    });
    describe("# given invalid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should fail on invalid tipping array length", async () => {
          const invalidArgument = [tipping[0], tipping[1]];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            invalidArgument,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid tokens array length", async () => {
          const invalidArgument = [
            seedTokenInstance.address,
            fundingTokenInstance.address,
            initializedSeedFactoryInstance.address,
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            invalidArgument,
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid startTimeAndEndTime array length", async () => {
          const invalidArgument = [
            startTime.toNumber(),
            endTime.toNumber(),
            startTime.toNumber(),
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            invalidArgument,
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid defaultClassParameters array length", async () => {
          const invalidArgument = [
            defaultClassParameters[0],
            defaultClassParameters[1],
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            invalidArgument,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail if tokens having identical addresses", async () => {
          const invalidArgument = [
            seedTokenInstance.address,
            seedTokenInstance.address,
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            invalidArgument,
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if admin and beneficiary having identical addresses", async () => {
          const invalidArgument = beneficiary.address;
          const invalidSeedArgs = [
            beneficiary.address,
            invalidArgument,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if beneficiary is equal zero", async () => {
          const invalidArgument = AddressZero;
          const invalidSeedArgs = [
            invalidArgument,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if admin is equal zero", async () => {
          const invalidArgument = AddressZero;
          const invalidSeedArgs = [
            beneficiary.address,
            invalidArgument,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if SeedToken is equal zero", async () => {
          const invalidArgument = AddressZero;
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [invalidArgument, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail is FundingToken is equal zero", async () => {
          const invalidArgument = AddressZero;
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, invalidArgument],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if softcap bigger than hardcap", async () => {
          const invalidArgument = [
            getFundingAmounts("110").toString(),
            hardCap,
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            invalidArgument,
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith(
            "SeedFactory: hardCap cannot be less than softCap"
          );
        });
        it("should fail if startTime > endTime", async () => {
          const invalidArgument = [
            (await endTime.add(await time.duration.days(7))).toNumber(),
            endTime.toNumber(),
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            invalidArgument,
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: invalid time");
        });
        it("should fail on startTime < current time", async () => {
          const invalidArgument = [
            (await time.latest()).toNumber(),
            endTime.toNumber(),
          ];
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            invalidArgument,
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            tipping,
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: invalid time");
        });
        it("should fail on tipping > max tipping", async () => {
          const invalidArgument = parseEther("0.50").toString();
          const invalidSeedArgs = [
            beneficiary.address,
            admin.address,
            [seedTokenInstance.address, fundingTokenInstance.address],
            [softCap, hardCap],
            price,
            [startTime.toNumber(), endTime.toNumber()],
            defaultClassParameters,
            permissioned,
            whitelistAddresses,
            [invalidArgument, tipping[1], tipping[2]],
            metadata,
          ];

          await expect(
            initializedSeedFactoryInstance.deploySeed(...invalidSeedArgs)
          ).to.be.revertedWith("SeedFactory: tip cannot be more than 45%");
        });
      });
    });
    describe("# given valid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should deploy a new Seed succesfully", async () => {
          const tx = await initializedSeedFactoryInstance.deploySeed(
            ...seedFactoryArgs
          );
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "SeedCreated";
          });
          const newSeedAddress = event[0].args[0];

          const seedInstance = await SeedFactory.attach(newSeedAddress);

          expect(await seedInstance.beneficiary()).to.equal(seedFactoryArgs[0]);
          expect(await seedInstance.admin()).to.equal(seedFactoryArgs[1]);
          expect(await seedInstance.seedToken()).to.equal(
            seedFactoryArgs[2][0]
          );
          expect(await seedInstance.fundingToken()).to.equal(
            seedFactoryArgs[2][1]
          );
          expect(await seedInstance.softCap()).to.equal(seedFactoryArgs[3][0]);
          expect(await seedInstance.hardCap()).to.equal(seedFactoryArgs[3][1]);
          expect(await seedInstance.metadata()).to.equal(seedFactoryArgs[10]);
        });
      });
    });
  });
});
