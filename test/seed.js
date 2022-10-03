const { expect } = require("chai");
const { waffle } = require("hardhat");

const { loadFixture } = waffle;
const { launchFixture } = require("./fixtures.js");

describe("> Contract: Seed", () => {
  let initializedSeedInstance, uninitializedSeedInstance, seedArguments;
  beforeEach(async () => {
    ({ initializedSeedInstance, uninitializedSeedInstance, seedArguments } =
      await loadFixture(launchFixture));
  });
  describe("$ Function: initialize()", () => {
    describe("# given the Seed has already been initialized", () => {
      describe("» when calling function initialze()", () => {
        it("should revert", async () => {
          await expect(
            initializedSeedInstance.initialize(...seedArguments)
          ).to.be.revertedWith("Seed: contract already initialized");
        });
      });
    });
    describe("# given the Seed has not been initialized", () => {
      describe("» when calling function initialize()", () => {
        it("should succeed", async () => {
          // ToDo: Add test for defaultClassParameters, whitelist and tipping in next PR
          expect(await uninitializedSeedInstance.initialized()).to.be.false;
          await expect(uninitializedSeedInstance.initialize(...seedArguments))
            .to.not.be.reverted;

          expect(await uninitializedSeedInstance.beneficiary()).to.equal(
            seedArguments[0]
          );
          expect(await uninitializedSeedInstance.admin()).to.equal(
            seedArguments[1]
          );
          expect(await uninitializedSeedInstance.seedToken()).to.equal(
            seedArguments[2][0]
          );
          expect(await uninitializedSeedInstance.fundingToken()).to.equal(
            seedArguments[2][1]
          );
          expect(await uninitializedSeedInstance.softCap()).to.equal(
            seedArguments[3][0]
          );
          expect(await uninitializedSeedInstance.hardCap()).to.equal(
            seedArguments[3][1]
          );
          // Note: uncomment after next PR
          // expect(await uninitializedSeedInstance.price()).to.equal(
          //   seedArguments[4]
          // );
          expect(await uninitializedSeedInstance.startTime()).to.equal(
            seedArguments[5][0]
          );
          expect(await uninitializedSeedInstance.endTime()).to.equal(
            seedArguments[5][1]
          );
          expect(await uninitializedSeedInstance.permissionedSeed()).to.equal(
            seedArguments[7]
          );
        });
      });
    });
  });
});
