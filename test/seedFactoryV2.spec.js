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
const { getConvertedParams } = require("./helpers/params/constructParams.js");
const {
  getERC20TokenInstances,
} = require("./helpers/contracts/tokens/tokens.js");
const { getTokenAmount } = require("./helpers/constants/TypesConverter");
const { types } = require("./helpers/constants/constants");
const { SEVEN_DAYS } = require("./helpers/constants/time.js");
/**
 * @typedef {import("../lib/types/types").SeedFactory} SeedFactory
 * @typedef {import("../lib/types/types").Seed} Seed
 */

describe("> Contract: SeedFactoryV2", () => {
  let root;
  let beneficiary;
  let treasury;
  let admin;

  before(async () => {
    ({ root, admin, beneficiary, treasury } = await getNamedTestSigners());
  });
  describe("$ Function: transferOwnership()", () => {
    /**
     * @type {SeedFactory}
     */
    let SeedFactoryV2_initialized;
    before(async () => {
      ({ SeedFactoryV2_initialized } = await loadFixture(launchFixture));
    });
    describe("# given the SeedFactory has been deployed", () => {
      describe("» when calling function transferOwnership()", () => {
        it("should revert if caller is not the owner", async () => {
          const params = {
            from: beneficiary,
            newOwner: root.address,
          };

          await expect(
            SeedFactoryV2_initialized.transferOwnership(params)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should revert if address is equal to zero", async () => {
          const params = {
            newOwner: AddressZero,
          };

          await expect(
            SeedFactoryV2_initialized.transferOwnership(params)
          ).to.be.revertedWith("Ownable: new owner is the zero address");
        });
        it("should succeed if caller is the owner", async () => {
          const params = { newOwner: beneficiary.address };

          expect(await SeedFactoryV2_initialized.owner).to.equal(root.address);
          await SeedFactoryV2_initialized.transferOwnership(params);
          expect(await SeedFactoryV2_initialized.owner).to.equal(
            beneficiary.address
          );
        });
      });
    });
  });
  describe("$ Function: setMasterCopy()", () => {
    /**@type {SeedFactory}*/
    let SeedFactoryV2_initialized;
    /**@type {SeedFactory}*/
    let SeedV2_funded;
    /**@type {Seed}*/
    let SeedV2_initialized;
    before(async () => {
      ({ SeedV2_initialized, SeedV2_funded, SeedFactoryV2_initialized } =
        await loadFixture(launchFixture));
    });
    describe("# given Seed master copy is not yet set", () => {
      describe("» when calling function setMasterCopy()", () => {
        it("should fail if Seed address is equal to SeedFactory address", async () => {
          const params = {
            seedAddress: SeedFactoryV2_initialized.instance.address,
          };

          await expect(
            SeedFactoryV2_initialized.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
        it("should fail if Seed address is equal zero", async () => {
          const params = { seedAddress: AddressZero };

          await expect(
            SeedFactoryV2_initialized.setMasterCopy(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
        it("should succeed in setting master copy", async () => {
          const params = { seedAddress: SeedV2_funded.instance.address };

          expect(
            await SeedFactoryV2_initialized.instance.masterCopy()
          ).to.equal(SeedV2_initialized.instance.address);

          await expect(SeedFactoryV2_initialized.setMasterCopy(params)).to.not
            .be.reverted;
          expect(
            await SeedFactoryV2_initialized.instance.masterCopy()
          ).to.equal(SeedV2_funded.instance.address);
        });
      });
    });
  });
  describe("$ Function: deploySeed()", () => {
    /** @type {SeedFactory}*/
    let SeedFactoryV2_initialized;
    let tokenInstances;
    let defaultSeedParameters;
    beforeEach(async () => {
      ({ SeedV2_initialized, SeedFactoryV2_initialized } = await loadFixture(
        launchFixture
      ));
      tokenInstances = await getERC20TokenInstances(
        await getConvertedParams(types.SEEDV2_TOKEN_PARAMS)
      );
      const params = { tokenInstances: tokenInstances };
      defaultSeedParameters = await getConvertedParams(
        types.SEEDFACTORYV2_DEPLOY_SEED,
        params
      );
      defaultSeedParameters.shift();
    });
    describe("# given invalid deployment parameters", () => {
      describe("» when calling with invalid tip array length", () => {
        it("should revert", async () => {
          const tipPercentage = defaultSeedParameters[9][0];
          const tipVestingCliff = defaultSeedParameters[9][1];
          const params = { tip: [tipPercentage, tipVestingCliff] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 102");
        });
      });
      describe("» when calling with invalid tokenAddresses array length", () => {
        it("should revert", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const thirdAddress = SeedFactoryV2_initialized.instance.address;
          const params = {
            tokenAddresses: [
              seedTokenAddress,
              fundingTokenAddress,
              thirdAddress,
            ],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 102");
        });
      });
      describe("» when calling with invalid startTimeAndEndTime array length", () => {
        it("should revert", async () => {
          const startTime = defaultSeedParameters[5][0];
          const endTime = defaultSeedParameters[5][1];
          const params = { startAndEndTime: [startTime, endTime, startTime] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 102");
        });
      });

      describe("» when calling with invalid defaultClassParameters array length", () => {
        it("should revert", async () => {
          const params = {
            defaultClassParameters: [
              defaultSeedParameters[6][0],
              defaultSeedParameters[6][1],
            ],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 102");
        });
      });
      describe("» when calling with tokenAddresses having identical addresses", () => {
        it("should revert", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = {
            tokenAddresses: [seedTokenAddress, seedTokenAddress],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 104");
        });
      });
      describe("» when calling with admin and beneficiary having identical addresses", () => {
        it("should revert", async () => {
          const beneficiaryAddress = defaultSeedParameters[0];
          const params = {
            beneficiary: beneficiaryAddress,
            projectAddresses: [beneficiaryAddress, treasury.address],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 104");
        });
      });
      describe("» when calling with treasury and beneficiary having identical addresses", () => {
        it("should revert", async () => {
          const beneficiaryAddress = defaultSeedParameters[0];
          const params = {
            beneficiary: beneficiaryAddress,
            projectAddresses: [admin.address, beneficiaryAddress],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 104");
        });
      });
      describe("» when calling with beneficiary is equal zero", () => {
        it("should revert", async () => {
          const params = { beneficiary: AddressZero };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
      });
      describe("» when calling with admin is equal zero", () => {
        it("should revert", async () => {
          const params = { projectAddresses: [admin.address, AddressZero] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
      });
      describe("» when calling with treasury is equal zero", () => {
        it("should revert", async () => {
          const params = { projectAddresses: [AddressZero, treasury.address] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
      });
      describe("» when calling with SeedToken is equal zero", () => {
        it("should revert", async () => {
          const fundingTokenAddress = defaultSeedParameters[2][1];
          const params = { tokenAddresses: [AddressZero, fundingTokenAddress] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
      });
      describe("» when calling with FundingToken is equal zero", () => {
        it("should revert", async () => {
          const seedTokenAddress = defaultSeedParameters[2][0];
          const params = { tokenAddresses: [seedTokenAddress, AddressZero] };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 100");
        });
      });
      describe("» when calling with softcap bigger than hardcap", () => {
        it("should revert", async () => {
          const fundingTokenDecimal = await tokenInstances[1].decimals();
          const getFundingAmounts = getTokenAmount(fundingTokenDecimal);
          const toLargeSoftCap = getFundingAmounts("110").toString();
          const params = {
            softAndHardCaps: [toLargeSoftCap, defaultSeedParameters[3][1]],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 300");
        });
      });
      describe("» when calling with startTime > endTime", () => {
        it("should revert", async () => {
          const startTime = defaultSeedParameters[5][0] + SEVEN_DAYS;
          const endTime = defaultSeedParameters[5][1];
          const params = {
            startAndEndTime: [startTime, endTime],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 106");
        });
      });
      describe("» when calling with startTime < current time", () => {
        it("should revert", async () => {
          const startTime = (await time.latest()).toNumber();
          const endTime = defaultSeedParameters[5][1];
          const params = {
            startAndEndTime: [startTime, endTime],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 106");
        });
      });
      describe("» when calling with tip > max tip", () => {
        it("should revert", async () => {
          const invalidTipPercentage = parseEther("0.50").toString();
          const tipVestingClif = defaultSeedParameters[9][1];
          const tipVestingDuration = defaultSeedParameters[9][2];
          const params = {
            tip: [invalidTipPercentage, tipVestingClif, tipVestingDuration],
          };

          await expect(
            SeedFactoryV2_initialized.deploySeed(params)
          ).to.be.revertedWith("SeedFactory: Error 301");
        });
      });
    });
    describe("# given valid deployment parameters", () => {
      describe("» when calling function deploySeed()", () => {
        it("should deploy a new Seed succesfully", async () => {
          const params = { tokenInstances: tokenInstances };
          const tx = await SeedFactoryV2_initialized.deploySeed(params);
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "SeedCreated";
          });
          const newSeedAddress = event[0].args[0];

          const SeedFactory = await ethers.getContractFactory("SeedV2", root);
          const SeedV2_initialized = SeedFactory.attach(newSeedAddress);

          expect(await SeedV2_initialized.beneficiary()).to.equal(
            defaultSeedParameters[0]
          );
          expect(await SeedV2_initialized.admin()).to.equal(
            defaultSeedParameters[1][0]
          );
          expect(await SeedV2_initialized.treasury()).to.equal(
            defaultSeedParameters[1][1]
          );
          expect(await SeedV2_initialized.seedToken()).to.equal(
            defaultSeedParameters[2][0]
          );
          expect(await SeedV2_initialized.fundingToken()).to.equal(
            defaultSeedParameters[2][1]
          );
          expect(await SeedV2_initialized.softCap()).to.equal(
            defaultSeedParameters[3][0]
          );
          expect(await SeedV2_initialized.hardCap()).to.equal(
            defaultSeedParameters[3][1]
          );
        });
      });
    });
  });
});
describe("> Contract: SeedFactoryV2NoAccessControl", () => {
  /**
   * @type {SeedFactory}
   */
  let SeedFactoryV2NoAccessControl_initialized;
  before(async () => {
    ({ root, beneficiary } = await getNamedTestSigners());
    ({ SeedFactoryV2NoAccessControl_initialized } = await loadFixture(
      launchFixture
    ));
  });
  describe("$ Function: deploySeed()", () => {});
  describe("# given the Seed has been deployed", () => {
    describe("» when the not the owner deploys a new Seed", () => {
      it("should succeed", async () => {
        await expect(
          SeedFactoryV2NoAccessControl_initialized.deploySeed({
            from: beneficiary,
          })
        ).to.not.be.reverted;
      });
    });
  });
});
