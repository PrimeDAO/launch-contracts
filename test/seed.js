const { expect } = require("chai");
const { waffle } = require("hardhat");
const { loadFixture } = waffle;
const { BigNumber } = require("ethers");

const { launchFixture } = require("./helpers/fixture");
const { getNamedTestSigners } = require("./helpers/accounts/signers.js");
const {
  increaseTime,
  ONE_DAY,
  getCurrentTime,
  TEN_DAYS,
  TWENTY_DAYS,
  FOURTY_DAYS,
} = require("./helpers/constants/time");

const {
  SeedBuilder,
} = require("./helpers/contracts/seed/builders/SeedBuilder");
const { types, EMPTY32BYTES } = require("./helpers/constants/constants");

describe("> Contract: Seed", () => {
  let beneficiary;
  let buyer1;
  let buyer2;
  let admin;

  before(async () => {
    ({ root, admin, beneficiary, buyer1, buyer2 } =
      await getNamedTestSigners());
  });
  describe("$ Function: initialize()", () => {
    let Seed_initialized;
    before(async () => {
      // Note: not sure why bet getting the Seed from the fixture does not work, but only here
      // ({ Seed_initialized } = await loadFixture(launchFixture));
      Seed_initialized = await SeedBuilder.createInit();
    });
    describe("# given the Seed has already been initialized", () => {
      describe("» when calling function initialze()", () => {
        it("should revert", async () => {
          await expect(Seed_initialized.initialize()).to.be.revertedWith(
            "Seed: contract already initialized"
          );
        });
      });
    });
    describe("# given the Seed has not been initialized", () => {
      describe("» when calling function initialize()", () => {
        it("should set beneficiary", async () => {
          expect(await Seed_initialized.instance.beneficiary()).to.equal(
            Seed_initialized.beneficiary
          );
        });
        it("should set admin", async () => {
          expect(await Seed_initialized.instance.admin()).to.equal(
            Seed_initialized.admin
          );
        });
        it("should set tokens", async () => {
          expect(await Seed_initialized.instance.seedToken()).to.equal(
            Seed_initialized.seedTokenAddress
          );
          expect(await Seed_initialized.instance.fundingToken()).to.equal(
            Seed_initialized.fundingTokenAddress
          );
        });
        it("should set caps", async () => {
          expect(await Seed_initialized.instance.softCap()).to.equal(
            Seed_initialized.softCap
          );
          expect(await Seed_initialized.instance.hardCap()).to.equal(
            Seed_initialized.hardCap
          );
        });
        it("should set price", async () => {
          expect(await Seed_initialized.instance.price()).to.equal(
            Seed_initialized.price
          );
        });
        it("should set start and end time", async () => {
          expect(await Seed_initialized.instance.startTime()).to.equal(
            Seed_initialized.startTime
          );
          expect(await Seed_initialized.instance.endTime()).to.equal(
            Seed_initialized.endTime
          );
        });
        it("should set permission", async () => {
          expect(await Seed_initialized.instance.permissionedSeed()).to.equal(
            Seed_initialized.permissionedSeed
          );
        });
        it("should set defaultContributorClass", async () => {
          const parameterDefaultClass = Seed_initialized.classes[0];
          const contractDefaultClass = await Seed_initialized.instance.classes(
            0
          );
          expect(contractDefaultClass.className).to.equal(EMPTY32BYTES);
          expect(contractDefaultClass.classCap).to.equal(
            Seed_initialized.hardCap
          );
          expect(contractDefaultClass.individualCap).to.equal(
            parameterDefaultClass[0]
          );
          expect(contractDefaultClass.vestingCliff).to.equal(
            parameterDefaultClass[1]
          );
          expect(contractDefaultClass.vestingDuration).to.equal(
            parameterDefaultClass[2]
          );
        });
        it("should set whitelist", async () => {
          // ToDo in next PR
        });
        it("should set tipping", async () => {
          // ToDo in next PR
        });
        it("should calculate seedAmountRequired", async () => {
          // ToDo in next PR
        });
      });
    });
  });
  describe("$ Function: changeClass()", () => {
    let Seed_initialized;
    beforeEach(async () => {
      ({ Seed_initialized } = await loadFixture(launchFixture));
    });
    describe("# given the caller is not the admin", () => {
      describe("» when calling function changeClass()", () => {
        it("should revert", async () => {
          const params = { from: beneficiary };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: caller should be admin"
          );
        });
      });
    });
    describe("# given the caller is the admin", () => {
      describe("» when called with invalid parametes", () => {
        it("should fail on invalid class ID", async () => {
          const params = { class: 1 };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: incorrect class chosen"
          );
        });
        it("should fail on individualCap > classCap ", async () => {
          const params = {
            individualCap: Seed_initialized.getFundingAmount("21").toString(),
          };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: caps are invalid"
          );
        });
        it("should fail on classCap > hardCap ", async () => {
          const params = {
            classCap: Seed_initialized.hardCap + 1,
          };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: caps are invalid"
          );
        });
        it("should fail if Seed already started", async () => {
          await expect(Seed_initialized.changeClass()).to.not.be.reverted;
          await increaseTime(ONE_DAY);
          await expect(Seed_initialized.changeClass()).to.be.revertedWith(
            "Seed: vesting is already started"
          );
        });
        it("should fail if Seed is closed", async () => {
          const localSeed = await SeedBuilder.createInit();
          await expect(localSeed.changeClass()).to.not.be.reverted;
          await localSeed.close();
          await expect(localSeed.changeClass()).to.be.revertedWith(
            "Seed: should not be closed"
          );
        });
      });
    });
  });
  describe("$ Function: buy()", () => {
    let Seed_funded;
    describe("» when the Seed is not active", () => {
      beforeEach(async () => {
        ({ Seed_funded } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      it("should revert if Seed is paused ", async () => {
        await expect(Seed_funded.buy()).to.not.be.reverted;

        await Seed_funded.pause();

        await expect(Seed_funded.buy()).to.be.revertedWith(
          "Seed: should not be paused"
        );
      });
      it("should revert if Seed is closed ", async () => {
        await expect(Seed_funded.buy()).to.not.be.reverted;
        await Seed_funded.close();
        await expect(Seed_funded.buy()).to.be.revertedWith(
          "Seed: should not be closed"
        );
      });
    });

    describe("# given the Seed is permissioned", () => {
      let Seed_fundedPermissioned;
      beforeEach(async () => {
        ({ Seed_fundedPermissioned } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      describe("» when a non allowlisted user tries to buy", () => {
        it("should revert", async () => {
          const params = { from: buyer1 };
          await expect(Seed_fundedPermissioned.buy(params)).to.be.revertedWith(
            "Seed: sender has no rights"
          );
        });
      });
      describe("» when a allowlisted user tries to buy", () => {
        it("should be able to buy", async () => {
          const buyerBalance =
            await Seed_fundedPermissioned.fundingTokenInstance.balanceOf(
              buyer1.address
            );
          const fundingAmount = Seed_fundedPermissioned.getFundingAmount("5");
          const params = { from: buyer1, fundingAmount: fundingAmount };
          const params2 = { from: admin, buyer: buyer1, class: types.CLASS_1 };
          const buyerBalanceAfterPurchase = BigNumber.from(
            buyerBalance.sub(fundingAmount)
          );

          await expect(Seed_fundedPermissioned.buy(params)).to.be.revertedWith(
            "Seed: sender has no rights"
          );
          expect(
            await Seed_fundedPermissioned.fundingTokenInstance.balanceOf(
              buyer1.address
            )
          ).to.equal(buyerBalance);

          await Seed_fundedPermissioned.whitelist(params2);

          await expect(Seed_fundedPermissioned.buy(params)).to.not.be.reverted;
          expect(
            await Seed_fundedPermissioned.fundingTokenInstance.balanceOf(
              buyer1.address
            )
          ).to.equal(buyerBalanceAfterPurchase);
        });
      });
    });
    describe("# given the Seed is permission-less", () => {
      before(async () => {
        before(async () => {
          ({ Seed_funded } = await loadFixture(launchFixture));
          await increaseTime(ONE_DAY);
        });
      });
      describe("» when a non allowlisted user tries to buy", () => {
        it("should be able to buy", async () => {
          const buyerBalance = await Seed_funded.fundingTokenInstance.balanceOf(
            buyer1.address
          );
          const fundingAmount = Seed_funded.getFundingAmount("5");
          const params = { from: buyer1, fundingAmount: fundingAmount };
          const buyerBalanceAfterPurchase = BigNumber.from(
            buyerBalance.sub(fundingAmount)
          );
          await expect(Seed_funded.buy(params)).to.not.be.reverted;
          expect(
            await Seed_funded.fundingTokenInstance.balanceOf(buyer1.address)
          ).to.equal(buyerBalanceAfterPurchase);
        });
      });
    });
    describe("» when the hardCap has been reached", () => {
      let Seed_fundedLowHardCap;
      before(async () => {
        ({ Seed_fundedLowHardCap } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
        await Seed_fundedLowHardCap.buy();
      });
      it("should revert", async () => {
        const params = {
          from: buyer2,
          fundingAmount: Seed_fundedLowHardCap.getFundingAmount("2"),
        };

        await expect(Seed_fundedLowHardCap.buy(params)).to.not.be.reverted;
        await expect(Seed_fundedLowHardCap.buy(params)).to.be.revertedWith(
          "Seed: maximum funding reached"
        );
      });
    });
    describe("» when the user tries to buy 0 tokens", () => {
      before(async () => {
        ({ Seed_funded } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      it("should revert", async () => {
        const params = {
          fundingAmount: Seed_funded.getFundingAmount("0"),
        };
        await expect(Seed_funded.buy(params)).to.be.revertedWith(
          "Seed: cannot buy 0 tokens"
        );
      });
    });
    describe("# given the user is part of a contributor class", () => {
      // Add more tests when changing function to add classes in the Seed contract
      let Seed_fundedLowHardCap;
      beforeEach(async () => {
        ({ Seed_fundedLowHardCap } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      describe("» when buying tokens exeeds the classCap", () => {
        it("should revert", async () => {
          const params = {
            fundingAmount: Seed_fundedLowHardCap.getFundingAmount("7"),
          };
          await expect(Seed_fundedLowHardCap.buy(params)).to.not.reverted;
          await expect(Seed_fundedLowHardCap.buy(params)).to.be.revertedWith(
            "Seed: maximum class funding reached"
          );
        });
      });
      describe("» when buying tokens exeeds the individualCap", () => {
        it("should revert", async () => {
          const params = {
            fundingAmount: Seed_fundedLowHardCap.getFundingAmount("11"),
          };
          await expect(Seed_fundedLowHardCap.buy(params)).to.be.revertedWith(
            "Seed: maximum personal funding reached"
          );
        });
      });
    });
    describe("» when the Seed is not live", () => {
      let Seed_notBuyable;
      before(async () => {
        const currentTime = await getCurrentTime();
        const params = {
          startAndEndTime: [
            currentTime.add(TEN_DAYS).toNumber(),
            currentTime.add(TWENTY_DAYS).toNumber(),
          ],
        };
        Seed_notBuyable = await SeedBuilder.createInit(params);
      });
      it("should fail if the startTime has not been reached", async () => {
        await expect(Seed_notBuyable.buy()).to.be.revertedWith(
          "Seed: only allowed during distribution period"
        );
      });
      it("should fail if EndTime has been reached", async () => {
        await increaseTime(FOURTY_DAYS);
        await expect(Seed_notBuyable.buy()).to.be.revertedWith(
          "Seed: only allowed during distribution period"
        );
      });
    });
    describe("» when the Seed has not been funded by the admin", () => {
      let Seed_initialized;
      before(async () => {
        ({ Seed_initialized } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      it("should revert", async () => {
        await expect(Seed_initialized.buy()).to.be.revertedWith(
          "Seed: sufficient seeds not provided"
        );
      });
    });
    describe("» when buyer is able to buy", () => {});
  });
  describe("$ Function: claim()", () => {
    describe("» when the softCap has not been reached", () => {});
    describe("» when the endTime or hardCap has not been reached ", () => {});
    describe("» when the user has no claimable amount", () => {});
    describe("» when the user want to claim more than is available", () => {});
    describe("» when", () => {});
  });
  describe("$ Function: retrieveFundingTokens()", () => {});
  describe("$ Function: pause()", () => {});
  describe("$ Function: unpause()", () => {});
  describe("$ Function: close()", () => {});
  describe("$ Function: retrieveSeedTokens()", () => {});
  describe("$ Function: whitelist()", () => {});
  describe("$ Function: whitelistBatch()", () => {});
  describe("$ Function: unwhitelist()", () => {});
  describe("$ Function: withdraw()", () => {});
  describe("$ Function: updateMetadata()", () => {});
  describe("$ Function: calculateClaim()", () => {});
  describe("$ Function: seedAmountForFunder()", () => {});
});
