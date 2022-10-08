const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const {
  utils: { parseEther },
  constants: { AddressZero },
} = ethers;

const { getNamedTestSigners } = require("./helpers/accounts/signers.js");
const {
  SeedFactoryBuilder,
} = require("./helpers/contracts/seed/builders/SeedFactoryBuilder.js");
const {
  SeedBuilder,
} = require("./helpers/contracts/seed/builders/SeedBuilder.js");
const {
  seedFactoryDeploySeedParams,
  tokenParams,
} = require("./helpers/params/constructParams.js");
const {
  getERC20TokenInstances,
} = require("./helpers/contracts/tokens/tokens.js");
const {
  getDecimals,
  getTokenAmount,
} = require("./helpers/types/TypesConverter");
const { SEVEN_DAYS } = require("./helpers/types/time.js");

describe.only("> Contract: SeedFactory", () => {
  let SeedFactoryInstance,
    root,
    beneficiary,
    SeedInstance,
    defaultSeedParameters,
    tokenInstances;

  before(async () => {
    ({ root, admin, beneficiary } = await getNamedTestSigners());
    SeedInstance = await SeedBuilder.create();
    tokenInstances = await getERC20TokenInstances(tokenParams());
    const params = { tokenInstances: tokenInstances };
    defaultSeedParameters = await seedFactoryDeploySeedParams(params);
  });
  describe("$ Function: transferOwnership()", () => {
    describe("# given the SeedFactory has been deployed", () => {
      before(async () => {
        SeedFactoryInstance = await SeedFactoryBuilder.create();
      });
      describe("» when calling function transferOwnership()", () => {
        it("should revert if caller is not the owner", async () => {
          const params = {
            from: beneficiary,
            newOwner: root.address,
          };
          await expect(
            SeedFactoryInstance.transferOwnership(params)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should revert if address is equal to zero", async () => {
          const params = {
            newOwner: AddressZero,
          };
          await expect(
            SeedFactoryInstance.transferOwnership(params)
          ).to.be.revertedWith("Ownable: new owner is the zero address");
        });
        it("should succeed if caller is the owner", async () => {
          const params = { newOwner: beneficiary.address };

          expect(await SeedFactoryInstance.owner).to.equal(root.address);
          await SeedFactoryInstance.transferOwnership(params);
          expect(await SeedFactoryInstance.owner).to.equal(beneficiary.address);
        });
      });
    });
  });
  describe("$ Function: setMasterCopy()", () => {
    describe("# given Seed master copy is not yet set", () => {
      before(async () => {
        SeedFactoryInstance = await SeedFactoryBuilder.create();
      });
      describe("» when calling function setMasterCopy()", () => {
        it("should fail if Seed address is equal to SeedFactory address", async () => {
          const params = { seedAddress: SeedFactoryInstance.instance.address };

          await expect(
            SeedFactoryInstance.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should fail if Seed address is equal zero", async () => {
          const params = { seedAddress: AddressZero };

          await expect(
            SeedFactoryInstance.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: new mastercopy cannot be set");
        });
        it("should succeed in setting master copy", async () => {
          const params = { seedAddress: SeedInstance.instance.address };

          expect(await SeedFactoryInstance.instance.masterCopy()).to.equal(
            AddressZero
          );

          await expect(SeedFactoryInstance.setMasterCopy(params)).to.not.be
            .reverted;
          expect(await SeedFactoryInstance.instance.masterCopy()).to.equal(
            SeedInstance.instance.address
          );
        });
      });
    });
  });
  describe("$ Function: deploySeed()", () => {
    before(async () => {
      const params = { seedAddress: SeedInstance.instance.address };

      SeedFactoryInstance = await SeedFactoryBuilder.createInit(params);
    });
    describe("# given Seed Mastecopy is not set", () => {
      describe("» when calling function deploySeed()", () => {
        it("should revert", async () => {
          const SeedFactoryUnInitialized = await SeedFactoryBuilder.create();
          await expect(
            SeedFactoryUnInitialized.deploySeed()
          ).to.be.revertedWith("SeedFactory: mastercopy has not been set");
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
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid tokenAddresses array length", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const thirdAddress = SeedInstance.instance.address;
          const params = {
            tokenAddresses: [
              seedTokenAddress,
              fundingTokenAddress,
              thirdAddress,
            ],
          };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail on invalid startTimeAndEndTime array length", async () => {
          const startTime = defaultSeedParameters[5][0];
          const endTime = defaultSeedParameters[5][1];
          const params = { startAndEndTime: [startTime, endTime, startTime] };

          await expect(
            SeedFactoryInstance.deploySeed(params)
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
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Invalid array length");
        });
        it("should fail if tokenAddresses having identical addresses", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = {
            tokenAddresses: [seedTokenAddress, seedTokenAddress],
          };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if admin and beneficiary having identical addresses", async () => {
          const beneficiaryAddress = defaultSeedParameters[0];
          const params = {
            beneficiary: beneficiaryAddress,
            admin: beneficiaryAddress,
          };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: addresses cannot be identical");
        });
        it("should fail if beneficiary is equal zero", async () => {
          const params = { beneficiary: AddressZero };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if admin is equal zero", async () => {
          const params = { admin: AddressZero };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if SeedToken is equal zero", async () => {
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const params = { tokenAddresses: [AddressZero, fundingTokenAddress] };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail is FundingToken is equal zero", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = { tokenAddresses: [seedTokenAddress, AddressZero] };

          await expect(
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Address cannot be zero");
        });
        it("should fail if softcap bigger than hardcap", async () => {
          const fundingTokenDecimal = (
            await getDecimals(tokenInstances[1])
          ).toString();
          const getFundingAmounts = getTokenAmount(fundingTokenDecimal);
          const toLargeSoftCap = getFundingAmounts("110").toString();
          const params = {
            softAndHardCaps: [toLargeSoftCap, defaultSeedParameters[3][1]],
          };

          await expect(
            SeedFactoryInstance.deploySeed(params)
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
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: invalid time");
        });
        it("should fail on startTime < current time", async () => {
          const startTime = (await time.latest()).toNumber();
          const endTime = defaultSeedParameters[5][1];
          const params = {
            startAndEndTime: [startTime, endTime],
          };

          await expect(
            SeedFactoryInstance.deploySeed(params)
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
            SeedFactoryInstance.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: tip cannot be more than 45%");
        });
      });
    });
    describe("# given valid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should deploy a new Seed succesfully", async () => {
          const params = { tokenInstances: tokenInstances };
          const tx = await SeedFactoryInstance.deploySeed(params);
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "SeedCreated";
          });
          const newSeedAddress = event[0].args[0];

          const SeedFactory = await ethers.getContractFactory("Seed", root);
          const seedInstance = await SeedFactory.attach(newSeedAddress);

          expect(await seedInstance.beneficiary()).to.equal(
            defaultSeedParameters[0]
          );
          expect(await seedInstance.admin()).to.equal(defaultSeedParameters[1]);
          expect(await seedInstance.seedToken()).to.equal(
            defaultSeedParameters[2][0]
          );
          expect(await seedInstance.fundingToken()).to.equal(
            defaultSeedParameters[2][1]
          );
          expect(await seedInstance.softCap()).to.equal(
            defaultSeedParameters[3][0]
          );
          expect(await seedInstance.hardCap()).to.equal(
            defaultSeedParameters[3][1]
          );
        });
      });
    });
  });
});
