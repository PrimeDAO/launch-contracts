const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { loadFixture } = waffle;

const {
  utils: { parseEther },
  constants: { AddressZero },
} = ethers;

const { launchFixture } = require("./helpers/fixture");

const { getNamedTestSigners } = require("./helpers/accounts/signers.js");
const {
  tokenParams,
  convertParams,
} = require("./helpers/params/constructParams.js");
const {
  getERC20TokenInstances,
} = require("./helpers/contracts/tokens/tokens.js");
const { getTokenAmount } = require("./helpers/types/TypesConverter");
const { types } = require("./helpers/types/types");
const { SEVEN_DAYS } = require("./helpers/types/time.js");

describe("> Contract: SeedFactory", () => {
  let root;
  let beneficiary;

  before(async () => {
    ({ root, admin, beneficiary } = await getNamedTestSigners());
  });
  describe("$ Function: transferOwnership()", () => {
    let SeedFactory_deployed;
    before(async () => {
      ({ SeedFactory_deployed } = await loadFixture(launchFixture));
    });
    describe("# given the SeedFactory has been deployed", () => {
      describe("» when calling function transferOwnership()", () => {
        it("should revert if caller is not the owner", async () => {
          const params = {
            from: beneficiary,
            newOwner: root.address,
          };

          await expect(
            SeedFactory_deployed.transferOwnership(params)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should revert if address is equal to zero", async () => {
          const params = {
            newOwner: AddressZero,
          };

          await expect(
            SeedFactory_deployed.transferOwnership(params)
          ).to.be.revertedWith("Ownable: new owner is the zero address");
        });
        it("should succeed if caller is the owner", async () => {
          const params = { newOwner: beneficiary.address };

          expect(await SeedFactory_deployed.owner).to.equal(root.address);
          await SeedFactory_deployed.transferOwnership(params);
          expect(await SeedFactory_deployed.owner).to.equal(
            beneficiary.address
          );
        });
      });
    });
  });
  describe("$ Function: setMasterCopy()", () => {
    let SeedFactory_deployed;
    let Seed_initialized;
    before(async () => {
      ({ SeedFactory_deployed, Seed_initialized } = await loadFixture(
        launchFixture
      ));
    });
    describe("# given Seed master copy is not yet set", () => {
      describe("» when calling function setMasterCopy()", () => {
        it("should fail if Seed address is equal to SeedFactory address", async () => {
          const params = {
            seedAddress: SeedFactory_deployed.instance.address,
          };

          await expect(
            SeedFactory_deployed.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should fail if Seed address is equal zero", async () => {
          const params = { seedAddress: AddressZero };

          await expect(
            SeedFactory_deployed.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should succeed in setting master copy", async () => {
          const params = { seedAddress: Seed_initialized.instance.address };

          expect(await SeedFactory_deployed.instance.masterCopy()).to.equal(
            AddressZero
          );

          await expect(SeedFactory_deployed.setMasterCopy(params)).to.not.be
            .reverted;
          expect(await SeedFactory_deployed.instance.masterCopy()).to.equal(
            Seed_initialized.instance.address
          );
        });
      });
    });
  });
  describe("$ Function: deploySeed()", () => {
    let SeedFactory_deployed;
    let SeedFactory_initialized;
    let tokenInstances;
    let defaultSeedParameters;
    beforeEach(async () => {
      ({ Seed_initialized, SeedFactory_initialized, SeedFactory_deployed } =
        await loadFixture(launchFixture));
      tokenInstances = await getERC20TokenInstances(tokenParams());
      const params = { tokenInstances: tokenInstances };
      defaultSeedParameters = await convertParams(
        types.SEEDFACTORY_DEPLOY_SEED,
        params
      );
      defaultSeedParameters.shift();
    });
    describe("# given Seed Mastecopy is not set", () => {
      describe("» when calling function deploySeed()", () => {
        it("should revert", async () => {
          await expect(SeedFactory_deployed.deploySeed()).to.be.revertedWith(
            "SeedFactory: mastercopy has not been set"
          );
        });
      });
    });
    describe("# given invalid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should fail on invalid tipping array length", async () => {
          const tipPercentage = defaultSeedParameters[9][0];
          const tipVestingCliff = defaultSeedParameters[9][1];
          const params = { tipping: [tipPercentage, tipVestingCliff] };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid tokenAddresses array length", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const thirdAddress = SeedFactory_initialized.instance.address;
          const params = {
            tokenAddresses: [
              seedTokenAddress,
              fundingTokenAddress,
              thirdAddress,
            ],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid startTimeAndEndTime array length", async () => {
          const startTime = defaultSeedParameters[5][0];
          const endTime = defaultSeedParameters[5][1];
          const params = { startAndEndTime: [startTime, endTime, startTime] };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid defaultClassParameters array length", async () => {
          const params = {
            defaultClassParameters: [
              defaultSeedParameters[6][0],
              defaultSeedParameters[6][1],
            ],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail if tokenAddresses having identical addresses", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = {
            tokenAddresses: [seedTokenAddress, seedTokenAddress],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if admin and beneficiary having identical addresses", async () => {
          const beneficiaryAddress = defaultSeedParameters[0];
          const params = {
            beneficiary: beneficiaryAddress,
            admin: beneficiaryAddress,
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if beneficiary is equal zero", async () => {
          const params = { beneficiary: AddressZero };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if admin is equal zero", async () => {
          const params = { admin: AddressZero };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if SeedToken is equal zero", async () => {
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const params = { tokenAddresses: [AddressZero, fundingTokenAddress] };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail is FundingToken is equal zero", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = { tokenAddresses: [seedTokenAddress, AddressZero] };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if softcap bigger than hardcap", async () => {
          const fundingTokenDecimal = await tokenInstances[1].decimals();
          const getFundingAmounts = getTokenAmount(fundingTokenDecimal);
          const toLargeSoftCap = getFundingAmounts("110").toString();
          const params = {
            softAndHardCaps: [toLargeSoftCap, defaultSeedParameters[3][1]],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith(
            "SeedFactory: hardCap cannot be less than softCap"
          );
        });
        it("should fail if startTime > endTime", async () => {
          const startTime = defaultSeedParameters[5][0] + SEVEN_DAYS;
          const endTime = defaultSeedParameters[5][1];
          const params = {
            startAndEndTime: [startTime, endTime],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: invalid time");
        });
        it("should fail on startTime < current time", async () => {
          const startTime = (await time.latest()).toNumber();
          const endTime = defaultSeedParameters[5][1];
          const params = {
            startAndEndTime: [startTime, endTime],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: invalid time");
        });
        it("should fail on tipping > max tipping", async () => {
          const invalidTipPercentage = parseEther("0.50").toString();
          const tipVestingClif = defaultSeedParameters[9][1];
          const tipVestingDuration = defaultSeedParameters[9][2];
          const params = {
            tipping: [invalidTipPercentage, tipVestingClif, tipVestingDuration],
          };

          await expect(
            SeedFactory_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: tip cannot be more than 45%");
        });
      });
    });
    describe("# given valid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should deploy a new Seed succesfully", async () => {
          const params = { tokenInstances: tokenInstances };
          const tx = await SeedFactory_initialized.deploySeed(params);
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "SeedCreated";
          });
          const newSeedAddress = event[0].args[0];

          const SeedFactory = await ethers.getContractFactory("Seed", root);
          const Seed_initialized = SeedFactory.attach(newSeedAddress);

          expect(await Seed_initialized.beneficiary()).to.equal(
            defaultSeedParameters[0]
          );
          expect(await Seed_initialized.admin()).to.equal(
            defaultSeedParameters[1]
          );
          expect(await Seed_initialized.seedToken()).to.equal(
            defaultSeedParameters[2][0]
          );
          expect(await Seed_initialized.fundingToken()).to.equal(
            defaultSeedParameters[2][1]
          );
          expect(await Seed_initialized.softCap()).to.equal(
            defaultSeedParameters[3][0]
          );
          expect(await Seed_initialized.hardCap()).to.equal(
            defaultSeedParameters[3][1]
          );
        });
      });
    });
  });
});
