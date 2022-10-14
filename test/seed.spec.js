const { waffle, ethers } = require("hardhat");
const {
  BigNumber,
  utils: { formatBytes32String, parseEther },
} = ethers;
const { expect } = require("chai");
const { loadFixture } = waffle;
const { launchFixture } = require("./helpers/fixture");
const {
  getNamedTestSigners,
  fundSignersAndSeed,
} = require("./helpers/accounts/signers.js");
const {
  increaseTime,
  getCurrentTime,
  ONE_DAY,
  FIVE_DAYS,
  TEN_DAYS,
  TWENTY_DAYS,
  FOURTY_DAYS,
  HUNDRED_DAYS,
  increaseTimeTo,
} = require("./helpers/constants/time");
const { getChangeClassParams } = require("./helpers/params/constructParams");
const {
  SeedBuilder,
} = require("./helpers/contracts/seed/builders/SeedBuilder");
const {
  types,
  EMPTY32BYTES,
  classTypes,
  PRECISION,
} = require("./helpers/constants/constants");
const {
  tokenAmountToPrecisionNormalizedFloat,
} = require("./helpers/constants/TypesConverter");
/**
 * @typedef {import("./helpers/types/types.js").Seed} Seed
 * @typedef {import("./helpers/types/types").ContributorClassFromContract} ContributorClassFromContract
 * @typedef {import("./helpers/types/types").FunderPortfolio} FunderPortfolio
 * @typedef {import("./helpers/types/types").Tip} Tip
 * @typedef {import("./helpers/types/types").AllowlistParams} AllowlistParams
 * @typedef {import("./helpers/types/types").ClassesParameters} ClassesParameters
 */

async function convertSeedToComplete(Seed) {
  await increaseTime(ONE_DAY);
  await Seed.buy();
  await increaseTime(TEN_DAYS);
}

describe("> Contract: Seed", () => {
  let beneficiary;
  let buyer1;
  let buyer2;
  let buyer3;
  let buyer4;
  let buyer5;
  let buyer6;
  let admin;

  before(async () => {
    ({
      root,
      admin,
      beneficiary,
      buyer1,
      buyer2,
      buyer3,
      buyer4,
      buyer5,
      buyer6,
    } = await getNamedTestSigners());
  });
  describe("$ Function: initialize()", () => {
    describe("# when the Seed has already been initialized", () => {
      it("should revert", async () => {
        const Seed_initialized = await SeedBuilder.createInit();
        await expect(Seed_initialized.initialize()).to.be.revertedWith(
          "Seed: contract already initialized"
        );
      });
    });
    describe("# given the Seed is permissonless", () => {
      /**@type {Seed}*/
      let Seed_permissonless;
      before(async () => {
        Seed_permissonless = await SeedBuilder.create();
        await Seed_permissonless.initialize();
      });
      describe("» when the Seed has been initialized", () => {
        it("should set beneficiary", async () => {
          expect(await Seed_permissonless.instance.beneficiary()).to.equal(
            Seed_permissonless.beneficiary
          );
        });
        it("should set admin", async () => {
          expect(await Seed_permissonless.instance.admin()).to.equal(
            Seed_permissonless.admin
          );
        });
        it("should set tokens", async () => {
          expect(await Seed_permissonless.instance.seedToken()).to.equal(
            Seed_permissonless.seedTokenAddress
          );
          expect(await Seed_permissonless.instance.fundingToken()).to.equal(
            Seed_permissonless.fundingTokenAddress
          );
        });
        it("should set caps", async () => {
          expect(await Seed_permissonless.instance.softCap()).to.equal(
            Seed_permissonless.softCap
          );
          expect(await Seed_permissonless.instance.hardCap()).to.equal(
            Seed_permissonless.hardCap
          );
        });
        it("should set price", async () => {
          expect(await Seed_permissonless.instance.price()).to.equal(
            Seed_permissonless.price
          );
        });
        it("should set start and end time", async () => {
          expect(await Seed_permissonless.instance.startTime()).to.equal(
            Seed_permissonless.startTime
          );
          expect(await Seed_permissonless.instance.endTime()).to.equal(
            Seed_permissonless.endTime
          );
        });
        it("should set permission", async () => {
          expect(await Seed_permissonless.instance.permissionedSeed()).to.equal(
            Seed_permissonless.permissionedSeed
          );
        });
        it("should set vestingStartTime", async () => {
          expect(await Seed_permissonless.instance.vestingStartTime()).to.equal(
            Seed_permissonless.endTime + 1
          );
        });
        it("should set defaultContributorClass", async () => {
          const parameterDefaultClass = Seed_permissonless.classes[0];
          const contractDefaultClass =
            await Seed_permissonless.instance.classes(classTypes.CLASS_DEFAULT);
          expect(contractDefaultClass.className).to.equal(EMPTY32BYTES);
          expect(contractDefaultClass.classCap).to.equal(
            Seed_permissonless.hardCap
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
        it("should set tip parameters", async () => {
          /**@type {Tip}*/
          const tip = await Seed_permissonless.getTip();
          expect(Seed_permissonless.tipPercentage).to.equal(tip.tipPercentage);
          expect(Seed_permissonless.tipVestingCliff).to.equal(tip.vestingCliff);
          expect(Seed_permissonless.tipVestingDuration).to.equal(
            tip.vestingDuration
          );
        });
        it("should calculate correct totalBuyableAmount", async () => {
          const hardCap = Seed_permissonless.hardCap;
          const price = Seed_permissonless.price;
          const totalBuyableSeed = BigNumber.from(hardCap)
            .mul(BigNumber.from(PRECISION))
            .div(BigNumber.from(price));

          expect(await Seed_permissonless.instance.totalBuyableSeed()).to.equal(
            totalBuyableSeed
          );
        });
        it("should calculate correct tipAmount", async () => {
          /**@type {Tip}*/
          const tip = await Seed_permissonless.getTip();
          const hardCap = Seed_permissonless.hardCap;
          const price = Seed_permissonless.price;
          const totalBuyableSeed = BigNumber.from(hardCap)
            .mul(BigNumber.from(PRECISION))
            .div(BigNumber.from(price));
          const tipAmount = BigNumber.from(totalBuyableSeed)
            .mul(BigNumber.from(Seed_permissonless.tipPercentage))
            .div(PRECISION);

          expect(tip.tipAmount).to.equal(tipAmount);
        });
        it("should calculate seedAmountRequired", async () => {
          const hardCap = Seed_permissonless.hardCap;
          const price = Seed_permissonless.price;
          const totalBuyableSeed = BigNumber.from(hardCap)
            .mul(BigNumber.from(PRECISION))
            .div(BigNumber.from(price));
          const tipAmount = BigNumber.from(totalBuyableSeed)
            .mul(BigNumber.from(Seed_permissonless.tipPercentage))
            .div(PRECISION);

          expect(await Seed_permissonless.getSeedAmoundRequired()).to.equal(
            tipAmount.add(totalBuyableSeed)
          );
        });
      });
    });
    describe("# given the Seed is permissoned", () => {
      /**@type {FunderPortfolio}*/
      let funder1;
      /** @type {FunderPortfolio}*/
      let funder2;
      /** @type {Seed}*/
      let Seed_permissoned;
      before(async () => {
        const params = {
          permissionedSeed: true,
          allowlist: [buyer1.address, buyer2.address],
        };
        Seed_permissoned = await SeedBuilder.create();
        await Seed_permissoned.initialize(params);
      });
      it("should set permission", async () => {
        expect(await Seed_permissoned.instance.permissionedSeed()).to.equal(
          Seed_permissoned.permissionedSeed
        );
      });
      it("should set addresses to allowlist", async () => {
        funder1 = await Seed_permissoned.getFunder(buyer1.address);
        funder2 = await Seed_permissoned.getFunder(buyer2.address);

        expect(funder1.allowlist).to.be.true;
        expect(funder2.allowlist).to.be.true;
      });
      it("should not set any allowlist", async () => {
        const Seed_initializedPermissonedNoAllowlist =
          await SeedBuilder.create();
        await Seed_initializedPermissonedNoAllowlist.initialize({
          permissionedSeed: true,
        });
        funder1 = await Seed_initializedPermissonedNoAllowlist.getFunder(
          buyer1.address
        );
        funder2 = await Seed_initializedPermissonedNoAllowlist.getFunder(
          buyer2.address
        );

        expect(funder1.allowlist).to.be.false;
        expect(funder2.allowlist).to.be.false;
      });
    });
    describe("# given the Seed has no tip", () => {
      /** @type {Seed}*/
      let Seed_noTip;
      before(async () => {
        const params = {
          tip: [0, 0, 0],
        };
        Seed_noTip = await SeedBuilder.create();
        await Seed_noTip.initialize(params);
      });
      it("should set tip parameters to 0", async () => {
        /**@type {Tip}*/
        const tip = await Seed_noTip.getTip();

        expect(tip.tipAmount).to.equal(0);
        expect(tip.vestingCliff).to.equal(0);
        expect(tip.vestingDuration).to.equal(0);
      });
      it("should calculate correct seedAmountRequired", async () => {
        const hardCap = Seed_noTip.hardCap;
        const price = Seed_noTip.price;
        const totalBuyableSeed = BigNumber.from(hardCap)
          .mul(BigNumber.from(PRECISION))
          .div(BigNumber.from(price));

        expect(await Seed_noTip.getSeedAmoundRequired()).to.equal(
          totalBuyableSeed
        );
      });
    });
  });
  describe("$ Function allowlist", () => {
    /**@type {Seed}*/
    let Seed_funded;
    beforeEach(async () => {
      ({ Seed_funded } = await loadFixture(launchFixture));
    });
    describe("# when seed is closed", () => {
      it("should revert", async () => {
        await expect(Seed_funded.setAllowlist()).to.not.be.reverted;

        await Seed_funded.close();

        await expect(Seed_funded.setAllowlist()).to.be.revertedWith(
          "Seed: Sale has been completed"
        );
      });
      describe("# when Seed has ended", () => {
        it("should revert", async () => {
          await expect(Seed_funded.setAllowlist()).to.not.be.reverted;

          await increaseTime(HUNDRED_DAYS);

          await expect(Seed_funded.setAllowlist()).to.be.revertedWith(
            "Seed: Sale has been completed"
          );
        });
      });
    });
    describe("# when array lengths are mismatching", () => {
      /**@type {AllowlistParams} */
      let params;
      it("should revert", async () => {
        const invalidLengthAllowlist = [buyer2.address, buyer3.address];
        const invalidLengthClasses = [
          classTypes.CLASS_DEFAULT,
          classTypes.CLASS_DEFAULT,
        ];

        params = {
          allowlist: invalidLengthAllowlist,
          classes: [classTypes.CLASS_DEFAULT],
        };
        await expect(Seed_funded.setAllowlist(params)).to.be.revertedWith(
          "Seed: mismatch in array length"
        );

        params = {
          allowlist: [buyer2.address],
          classes: invalidLengthClasses,
        };
        await expect(
          Seed_funded.setAllowlist({ classes: invalidLengthClasses })
        ).to.be.revertedWith("Seed: mismatch in array length");
      });
    });
    describe("# when invalid class ID is used", () => {
      it("should revert", async () => {
        await expect(
          Seed_funded.setAllowlist({ classes: [4] })
        ).to.be.revertedWith("Seed: incorrect class chosen");
      });
    });
    describe("# given seed is permission-less", () => {
      /** @type {FunderPortfolio} */
      let funder;
      describe("» when adding single buyer to class allowlist", () => {
        it("should succees", async () => {
          await Seed_funded.addClassesAndAllowlists();
          funder = await Seed_funded.getFunder(buyer3.address);

          expect(funder.allowlist).to.be.false;
          expect(funder.class).to.equal(0);

          const params = {
            allowlist: [buyer3.address],
            classes: [classTypes.CLASS_2],
          };

          await expect(Seed_funded.setAllowlist(params)).to.not.be.reverted;
          funder = await Seed_funded.getFunder(buyer3.address);
          expect(funder.class).to.equal(classTypes.CLASS_2);
          expect(funder.allowlist).to.be.false;
        });
      });
      describe("» when adding multiple buyers to different classes allowlists", () => {
        before(async () => {});
        let funder1;
        let funder2;
        let funder3;
        it("should succeed", async () => {
          await Seed_funded.addClassesAndAllowlists({
            classesParameters: { class1: {}, class2: {}, class3: {} },
          });
          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);
          funder3 = await Seed_funded.getFunder(buyer3.address);

          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(funder3.allowlist).to.be.false;
          expect(funder1.class).to.equal(0);
          expect(funder2.class).to.equal(0);
          expect(funder3.class).to.equal(0);

          const params = {
            allowlist: [buyer1.address, buyer2.address, buyer3.address],
            classes: [
              classTypes.CLASS_1,
              classTypes.CLASS_2,
              classTypes.CLASS_3,
            ],
          };

          await expect(Seed_funded.setAllowlist(params)).to.not.be.reverted;

          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);
          funder3 = await Seed_funded.getFunder(buyer3.address);

          expect(funder1.class).to.equal(classTypes.CLASS_1);
          expect(funder2.class).to.equal(classTypes.CLASS_2);
          expect(funder3.class).to.equal(classTypes.CLASS_3);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(funder3.allowlist).to.be.false;
        });
      });
    });
    describe("# given seed is permissioned", () => {
      let Seed_fundedPermissioned;
      before(async () => {
        ({ Seed_fundedPermissioned } = await loadFixture(launchFixture));
      });
      /**@type {FunderPortfolio}*/
      let funder;
      describe("» when adding single buyer to class allowlist", () => {
        it("should succees", async () => {
          await Seed_fundedPermissioned.addClassesAndAllowlists();
          funder = await Seed_fundedPermissioned.getFunder(buyer3.address);

          expect(funder.allowlist).to.be.false;
          expect(funder.class).to.equal(0);

          const params = {
            allowlist: [buyer3.address],
            classes: [classTypes.CLASS_2],
          };

          await expect(Seed_fundedPermissioned.setAllowlist(params)).to.not.be
            .reverted;
          funder = await Seed_fundedPermissioned.getFunder(buyer3.address);
          expect(funder.class).to.equal(classTypes.CLASS_2);
          expect(funder.allowlist).to.be.true;
        });
      });
      describe("» when adding multiple buyers to different classes allowlists", () => {
        before(async () => {});
        let funder1;
        let funder2;
        let funder3;
        it("should succeed", async () => {
          await Seed_fundedPermissioned.addClassesAndAllowlists({
            classesParameters: { class1: {}, class2: {}, class3: {} },
          });
          funder1 = await Seed_fundedPermissioned.getFunder(buyer1.address);
          funder2 = await Seed_fundedPermissioned.getFunder(buyer2.address);
          funder3 = await Seed_fundedPermissioned.getFunder(buyer3.address);

          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(funder3.allowlist).to.be.false;
          expect(funder1.class).to.equal(0);
          expect(funder2.class).to.equal(0);
          expect(funder3.class).to.equal(0);

          const params = {
            allowlist: [buyer1.address, buyer2.address, buyer3.address],
            classes: [
              classTypes.CLASS_1,
              classTypes.CLASS_2,
              classTypes.CLASS_3,
            ],
          };

          await expect(Seed_fundedPermissioned.setAllowlist(params)).to.not.be
            .reverted;

          funder1 = await Seed_fundedPermissioned.getFunder(buyer1.address);
          funder2 = await Seed_fundedPermissioned.getFunder(buyer2.address);
          funder3 = await Seed_fundedPermissioned.getFunder(buyer3.address);

          expect(funder1.class).to.equal(classTypes.CLASS_1);
          expect(funder2.class).to.equal(classTypes.CLASS_2);
          expect(funder3.class).to.equal(classTypes.CLASS_3);
          expect(funder1.allowlist).to.be.true;
          expect(funder2.allowlist).to.be.true;
          expect(funder3.allowlist).to.be.true;
        });
      });
    });
    describe("# when adding buyers before the Seed is live", () => {
      it("should succees", async () => {
        // Check that startTime hasn't been reached
        expect((await getCurrentTime()).toNumber()).to.be.below(
          Seed_funded.startTime
        );

        await Seed_funded.addClassesAndAllowlists();
        funder = await Seed_funded.getFunder(buyer3.address);

        expect(funder.allowlist).to.be.false;
        expect(funder.class).to.equal(0);

        const params = {
          allowlist: [buyer3.address],
          classes: [classTypes.CLASS_2],
        };

        await expect(Seed_funded.setAllowlist(params)).to.not.be.reverted;

        funder = await Seed_funded.getFunder(buyer3.address);

        expect(funder.class).to.equal(classTypes.CLASS_2);
        expect(funder.allowlist).to.be.false;
      });
    });
    describe("# when adding buyers while the Seed is live", () => {
      it("should succees", async () => {
        expect((await getCurrentTime()).toNumber()).to.be.below(
          Seed_funded.startTime
        );
        await increaseTime(ONE_DAY);

        // Check that Seed is live
        expect((await getCurrentTime()).toNumber()).to.be.above(
          Seed_funded.startTime
        );

        await Seed_funded.addClassesAndAllowlists();
        funder = await Seed_funded.getFunder(buyer3.address);

        expect(funder.allowlist).to.be.false;
        expect(funder.class).to.equal(0);

        const params = {
          allowlist: [buyer3.address],
          classes: [classTypes.CLASS_2],
        };

        await expect(Seed_funded.setAllowlist(params)).to.not.be.reverted;

        funder = await Seed_funded.getFunder(buyer3.address);

        expect(funder.class).to.equal(classTypes.CLASS_2);
        expect(funder.allowlist).to.be.false;
      });
    });
  });
  describe("$ Function: addClassesAndAllowlists", () => {
    /**@type {Seed}*/
    let Seed_funded;
    beforeEach(async () => {
      ({ Seed_funded } = await loadFixture(launchFixture));
    });
    describe("# when not called by the admin", () => {
      it("should revert", async () => {
        const params = {
          from: buyer1,
        };
        await expect(
          Seed_funded.addClassesAndAllowlists(params)
        ).to.be.revertedWith("Seed: caller should be admin");
      });
    });
    describe("# when Seed is not live (closed or ended)", () => {
      it("should revert when closed", async () => {
        await Seed_funded.close();

        await expect(Seed_funded.addClassesAndAllowlists()).to.be.revertedWith(
          "Seed: Sale has been completed"
        );
      });
      it("should revert when ended", async () => {
        await increaseTime(TWENTY_DAYS);
        await expect(Seed_funded.addClassesAndAllowlists()).to.be.revertedWith(
          "Seed: Sale has been completed"
        );
      });
    });
    describe("# when individualCap > classCap", () => {
      it("should revert", async () => {
        const params = {
          classesParameters: {
            class1: {
              individualCap: Seed_funded.getFundingAmount("15").toString(),
              classCap: Seed_funded.getFundingAmount("10").toString(),
            },
          },
        };

        await expect(
          Seed_funded.addClassesAndAllowlists(params)
        ).to.be.revertedWith("Seed: caps are invalid");
      });
    });
    describe("# when classCap > hardCap", () => {
      it("should revert", async () => {
        const params = {
          classesParameters: {
            class1: {
              classCap: Seed_funded.getFundingAmount("110").toString(),
            },
          },
        };

        await expect(
          Seed_funded.addClassesAndAllowlists(params)
        ).to.be.revertedWith("Seed: caps are invalid");
      });
    });
    describe("# when classCap is 0", () => {
      it("should revert", async () => {
        const params = {
          classesParameters: {
            class1: {
              classCap: "0",
            },
          },
        };

        await expect(
          Seed_funded.addClassesAndAllowlists(params)
        ).to.be.revertedWith("Seed: caps are invalid");
      });
    });
    describe("# given mismatching array lengths ", () => {
      let addClassParams;
      beforeEach(() => {
        addClassParams = {
          classNames: [
            formatBytes32String("buyer1"),
            formatBytes32String("buyers2"),
          ],
          classCaps: [
            Seed_funded.getFundingAmount("10").toString(),
            Seed_funded.getFundingAmount("10").toString(),
          ],
          individualCaps: [
            Seed_funded.getFundingAmount("5").toString(),
            Seed_funded.getFundingAmount("5").toString(),
          ],
          vestingCliffs: [TEN_DAYS.toNumber(), TEN_DAYS.toNumber()],
          vestingDurations: [TWENTY_DAYS.toNumber(), TWENTY_DAYS.toNumber()],
          allowlist: [
            [buyer1.address, buyer2.address],
            [buyer3.address, buyer4.address],
          ],
        };
      });
      describe("» when mismatch in classNames array", () => {
        it("should revert", async () => {
          addClassParams.classNames = [formatBytes32String("buyer1")];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
      describe("» when mismatch in classCaps array", () => {
        it("should revert", async () => {
          addClassParams.classCaps = [
            Seed_funded.getFundingAmount("10").toString(),
          ];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
      describe("» when mismatch in individualCaps array", () => {
        it("should revert", async () => {
          addClassParams.individualCaps = [
            Seed_funded.getFundingAmount("5").toString(),
          ];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
      describe("» when mismatch in vestingCliffs array", () => {
        it("should revert", async () => {
          addClassParams.vestingCliffs = [TEN_DAYS.toNumber()];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
      describe("» when mismatch in vestingDurations array", () => {
        it("should revert", async () => {
          addClassParams.vestingCliffs = [TWENTY_DAYS.toNumber()];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
      describe("» when mismatch in first level of allowlist array", () => {
        it("should revert", async () => {
          addClassParams.allowlist = [
            [buyer1.address, buyer2.address, buyer3.address],
          ];

          const params = Object.values(addClassParams);
          await expect(
            Seed_funded.instance
              .connect(admin)
              .addClassesAndAllowlists(...params)
          ).to.be.revertedWith("Seed: All provided arrays should be same size");
        });
      });
    });
    describe("# when array length is bigger then 100", () => {
      it("should revert", async () => {
        const params = {
          numberOfRandomClasses: 101,
        };
        await expect(
          Seed_funded.addClassesAndAllowlists(params)
        ).to.be.revertedWith(
          "Seed: Can't add batch with more then 100 classes"
        );
      });
    });
    describe("# when adding classes exeeds max number of classes ", () => {
      it("should revert", async () => {
        /**
         * @type {Seed}
         */
        const { Seed_highNumClasses } = await loadFixture(launchFixture);
        const params = {
          numberOfRandomClasses: 1,
        };

        await expect(
          Seed_highNumClasses.addClassesAndAllowlists({
            numberOfRandomClasses: 55,
          })
        ).to.not.reverted;

        await expect(
          Seed_highNumClasses.addClassesAndAllowlists(params)
        ).to.be.revertedWith("Seed: can't add more then 256 classes");
      });
    });
    describe("# given the Seed is permission-less", () => {
      /**@type {FunderPortfolio}*/
      let funder1;
      /**@type {FunderPortfolio}*/
      let funder2;
      /**@type {FunderPortfolio}*/
      let funder3;
      /**@type {FunderPortfolio}*/
      let funder4;
      /**@type {FunderPortfolio}*/
      let funder5;
      /**@type {FunderPortfolio}*/
      let funder6;
      /**@type {ClassesParameters}*/
      let classesParams;
      beforeEach(async () => {
        classesParams = {
          class1: {
            className: "buyer1",
            classCap: Seed_funded.getFundingAmount("10").toString(),
            individualCap: Seed_funded.getFundingAmount("5").toString(),
            vestingCliff: TEN_DAYS.toNumber(),
            vestingDuration: TWENTY_DAYS.toNumber(),
            allowlist: [[buyer1.address, buyer2.address]],
          },
          class2: {
            className: "buyer2",
            classCap: Seed_funded.getFundingAmount("15").toString(),
            individualCap: Seed_funded.getFundingAmount("10").toString(),
            vestingCliff: TWENTY_DAYS.toNumber(),
            vestingDuration: FOURTY_DAYS.toNumber(),
            allowlist: [[buyer3.address, buyer4.address]],
          },
          class3: {
            className: "buyer3",
            classCap: Seed_funded.getFundingAmount("20").toString(),
            individualCap: Seed_funded.getFundingAmount("15").toString(),
            vestingCliff: FOURTY_DAYS.toNumber(),
            vestingDuration: HUNDRED_DAYS.toNumber(),
            allowlist: [[buyer5.address, buyer6.address]],
          },
        };
        // Get funder portfolio
        funder1 = await Seed_funded.getFunder(buyer1.address);
        funder2 = await Seed_funded.getFunder(buyer2.address);
        funder3 = await Seed_funded.getFunder(buyer3.address);
        funder4 = await Seed_funded.getFunder(buyer4.address);
        funder5 = await Seed_funded.getFunder(buyer5.address);
        funder6 = await Seed_funded.getFunder(buyer6.address);
      });
      describe("» when adding single class with allowlist", () => {
        it("should succeed", async () => {
          // Check that values are default values
          expect(funder1.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder2.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          await expect(Seed_funded.getClass(classTypes.CLASS_1)).to.be.reverted;

          // Set classes and allowlist
          const params = {
            classesParameters: { class1: classesParams.class1 },
          };
          await Seed_funded.addClassesAndAllowlists(params);

          // Get funders portfolio
          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);

          // Get new lass
          const newClass = await Seed_funded.getClass(classTypes.CLASS_1);

          // Check values
          expect(funder1.class).to.equal(classTypes.CLASS_1);
          expect(funder2.class).to.equal(classTypes.CLASS_1);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(newClass.className).to.equal(
            formatBytes32String(classesParams.class1.className)
          );
          expect(newClass.classCap).to.equal(classesParams.class1.classCap);
          expect(newClass.individualCap).to.equal(
            classesParams.class1.individualCap
          );
          expect(newClass.vestingCliff).to.equal(
            classesParams.class1.vestingCliff
          );
          expect(newClass.vestingDuration).to.equal(
            classesParams.class1.vestingDuration
          );
        });
      });
      describe("» when adding single class without allowlist", () => {
        it("should succeed", async () => {
          // Check that values are default values
          expect(funder1.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder2.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          await expect(Seed_funded.getClass(classTypes.CLASS_1)).to.be.reverted;

          // Set classes and allowlist
          classesParams.class1.allowlist = [[]];
          const params = {
            classesParameters: { class1: classesParams.class1 },
          };
          await Seed_funded.addClassesAndAllowlists(params);

          // Get funders portfolio
          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);

          // Get new lass
          const newClass = await Seed_funded.getClass(classTypes.CLASS_1);

          // Check values
          expect(funder1.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder2.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(newClass.className).to.equal(
            formatBytes32String(classesParams.class1.className)
          );
          expect(newClass.classCap).to.equal(classesParams.class1.classCap);
          expect(newClass.individualCap).to.equal(
            classesParams.class1.individualCap
          );
          expect(newClass.vestingCliff).to.equal(
            classesParams.class1.vestingCliff
          );
          expect(newClass.vestingDuration).to.equal(
            classesParams.class1.vestingDuration
          );
        });
      });
      describe("» when adding multiple classes with multiple allowlists", () => {
        it("should succeed", async () => {
          // Check that values are default values
          expect(funder1.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder2.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder3.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder4.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(funder4.allowlist).to.be.false;
          expect(funder4.allowlist).to.be.false;
          await expect(Seed_funded.getClass(classTypes.CLASS_1)).to.be.reverted;
          await expect(Seed_funded.getClass(classTypes.CLASS_2)).to.be.reverted;

          // Set classes and allowlist
          const params = {
            classesParameters: classesParams,
          };
          await Seed_funded.addClassesAndAllowlists(params);

          // Get funders portfolio
          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);
          funder3 = await Seed_funded.getFunder(buyer3.address);
          funder4 = await Seed_funded.getFunder(buyer4.address);

          // Get new lass
          const newClass1 = await Seed_funded.getClass(classTypes.CLASS_1);
          const newClass2 = await Seed_funded.getClass(classTypes.CLASS_2);

          // Check values
          expect(funder1.class).to.equal(classTypes.CLASS_1);
          expect(funder2.class).to.equal(classTypes.CLASS_1);
          expect(funder3.class).to.equal(classTypes.CLASS_2);
          expect(funder4.class).to.equal(classTypes.CLASS_2);
          expect(funder1.allowlist).to.be.false;
          expect(funder2.allowlist).to.be.false;
          expect(funder3.allowlist).to.be.false;
          expect(funder4.allowlist).to.be.false;
          expect(newClass1.className).to.equal(
            formatBytes32String(classesParams.class1.className)
          );
          expect(newClass1.classCap).to.equal(classesParams.class1.classCap);
          expect(newClass1.individualCap).to.equal(
            classesParams.class1.individualCap
          );
          expect(newClass1.vestingCliff).to.equal(
            classesParams.class1.vestingCliff
          );
          expect(newClass1.vestingDuration).to.equal(
            classesParams.class1.vestingDuration
          );
          expect(newClass2.className).to.equal(
            formatBytes32String(classesParams.class2.className)
          );
          expect(newClass2.classCap).to.equal(classesParams.class2.classCap);
          expect(newClass2.individualCap).to.equal(
            classesParams.class2.individualCap
          );
          expect(newClass2.vestingCliff).to.equal(
            classesParams.class2.vestingCliff
          );
          expect(newClass2.vestingDuration).to.equal(
            classesParams.class2.vestingDuration
          );
        });
      });
      describe("» when adding multiple classes with only some whitelists", () => {
        it("should succeed", async () => {
          // Set classes and allowlist
          const emptyAllowlist = [[]];
          classesParams.class1.allowlist = emptyAllowlist;
          classesParams.class3.allowlist = emptyAllowlist;
          const params = {
            classesParameters: {
              class1: classesParams.class1,
              class2: classesParams.class2,
              class3: classesParams.class3,
            },
          };
          await Seed_funded.addClassesAndAllowlists(params);

          // Get funders portfolio
          funder1 = await Seed_funded.getFunder(buyer1.address);
          funder2 = await Seed_funded.getFunder(buyer2.address);
          funder3 = await Seed_funded.getFunder(buyer3.address);
          funder4 = await Seed_funded.getFunder(buyer4.address);
          funder5 = await Seed_funded.getFunder(buyer5.address);
          funder6 = await Seed_funded.getFunder(buyer6.address);

          // Check class values
          expect(funder1.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder2.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder3.class).to.equal(classTypes.CLASS_2);
          expect(funder4.class).to.equal(classTypes.CLASS_2);
          expect(funder5.class).to.equal(classTypes.CLASS_DEFAULT);
          expect(funder6.class).to.equal(classTypes.CLASS_DEFAULT);
        });
      });
    });
  });
  describe("$ Function: changeClass()", () => {
    /**@type {Seed}*/
    let Seed_initialized;
    beforeEach(async () => {
      ({ Seed_initialized } = await loadFixture(launchFixture));
    });
    describe("# when the caller is not the admin", () => {
      it("should revert", async () => {
        const params = { from: beneficiary };
        await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
          "Seed: caller should be admin"
        );
      });
    });
    describe("# given the caller is the admin", () => {
      describe("» when called with invalid class ID", () => {
        it("should revert", async () => {
          const params = { class: classTypes.CLASS_2 };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: incorrect class chosen"
          );
        });
      });
      describe("» when called with individualCap > classCap", () => {
        it("should revert", async () => {
          const params = {
            individualCap: Seed_initialized.getFundingAmount("21").toString(),
          };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: caps are invalid"
          );
        });
      });
      describe("» when called with classCap > hardCap", () => {
        it("should revert", async () => {
          const params = {
            classCap: Seed_initialized.hardCap + 1,
          };
          await expect(Seed_initialized.changeClass(params)).to.be.revertedWith(
            "Seed: caps are invalid"
          );
        });
      });
      describe("» when Seed is closed", () => {
        it("should revert", async () => {
          const localSeed = await SeedBuilder.createInit();
          await localSeed.changeClass();
          // await expect(localSeed.changeClass()).to.not.be.reverted;
          await localSeed.close();
          await expect(localSeed.changeClass()).to.be.revertedWith(
            "Seed: should not be closed"
          );
        });
      });
      describe("» when called with valid parameters", () => {
        it("should succeed in changing the class paramaters", async () => {
          /**@type {ContributorClassFromContract}*/
          let contributorClass;
          const updatedClassParams = getChangeClassParams({
            class: classTypes.CLASS_DEFAULT,
          });
          const params = {
            from: admin,
            class: classTypes.CLASS_DEFAULT,
          };
          contributorClass = await Seed_initialized.getClass(
            classTypes.CLASS_DEFAULT
          );
          expect(contributorClass.className).to.not.equal(
            updatedClassParams[1]
          );
          expect(contributorClass.classCap).to.not.equal(updatedClassParams[2]);
          expect(contributorClass.individualCap).to.not.equal(
            updatedClassParams[3]
          );
          expect(contributorClass.vestingCliff).to.not.equal(
            updatedClassParams[4]
          );
          expect(contributorClass.vestingDuration).to.not.equal(
            updatedClassParams[5]
          );

          await Seed_initialized.changeClass(params);
          contributorClass = await Seed_initialized.getClass(
            classTypes.CLASS_DEFAULT
          );

          expect(contributorClass.className).to.equal(updatedClassParams[1]);
          expect(contributorClass.classCap).to.equal(updatedClassParams[2]);
          expect(contributorClass.individualCap).to.equal(
            updatedClassParams[3]
          );
          expect(contributorClass.vestingCliff).to.equal(updatedClassParams[4]);
          expect(contributorClass.vestingDuration).to.equal(
            updatedClassParams[5]
          );
        });
      });
    });
  });
  describe("$ Function: buy()", () => {
    /**@type {Seed}*/
    let Seed_funded;
    describe("# when the Seed is not active", () => {
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
      /**@type {Seed}*/
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

          await Seed_fundedPermissioned.setAllowlist(params2);

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
    describe("# when the hardCap has been reached", () => {
      /**@type {Seed}*/
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
    describe("# when the user tries to buy 0 tokens", () => {
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
      /**@type {Seed}*/
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
    describe("# when the Seed is not live", () => {
      /**@type {Seed}*/
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
    describe("# when the Seed has not been funded by the admin", () => {
      /**
       * @type {Seed}
       */
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
    describe("# when buying has been successful", () => {
      /**@type {Seed}*/
      let Seed_funded;
      let buyParams;
      let seedAmountBought;
      beforeEach(async () => {
        ({ Seed_funded } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
        buyParams = { fundingAmount: Seed_funded.getFundingAmount("10") };
        seedAmountBought = Seed_funded.getSeedAmountFromFundingAmount(
          buyParams.fundingAmount
        );
      });
      it("should update fundingCollected", async () => {
        expect(await Seed_funded.getFundingCollected()).to.equal(0);

        await Seed_funded.buy(buyParams);

        expect(await Seed_funded.getFundingCollected()).to.equal(
          buyParams.fundingAmount
        );
      });
      it("should update funders fundingAmount", async () => {
        /**@type {FunderPortfolio}*/
        let funder;
        funder = await Seed_funded.getFunder(buyer1.address);

        expect(funder.fundingAmount).to.equal(0);

        await Seed_funded.buy(buyParams);
        funder = await Seed_funded.getFunder(buyer1.address);

        expect(funder.fundingAmount).to.equal(buyParams.fundingAmount);
      });
      it("should update the funding collected through the class", async () => {
        /**@type {ContributorClassFromContract}*/
        let contributorClass;
        const funder = await Seed_funded.getFunder(buyer1.address);
        contributorClass = await Seed_funded.getClass(funder.class);

        expect(contributorClass.classFundingCollected).to.equal(0);

        await Seed_funded.buy(buyParams);
        contributorClass = await Seed_funded.getClass(funder.class);

        expect(contributorClass.classFundingCollected).to.equal(
          buyParams.fundingAmount
        );
      });
      it("should update the seedRemainder", async () => {
        let seedRemainder;
        seedRemainder = await Seed_funded.getSeedRemainder();
        await Seed_funded.buy(buyParams);
        seedRemainder = BigNumber.from(seedRemainder).sub(seedAmountBought);

        expect(await Seed_funded.getSeedRemainder()).to.equal(seedRemainder);
      });
      it("should update the fundersCount", async () => {
        expect(await Seed_funded.getTotalFunderCount()).to.equal(0);

        await Seed_funded.buy({ from: buyer1 });

        expect(await Seed_funded.getTotalFunderCount()).to.equal(1);

        await Seed_funded.buy({ from: buyer2 });

        expect(await Seed_funded.getTotalFunderCount()).to.equal(2);
      });
      it("should emit the amount bought", async () => {
        const tx = await Seed_funded.buy(buyParams);
        const receipt = await tx.wait();
        const event = receipt.events.filter((x) => {
          return x.event == "SeedsPurchased";
        });
        const buyer1Address = event[0].args[0];
        const seedAmount = event[0].args[1];
        const seedRemainder = event[0].args[2];
        const seedRemainderFromContract = await Seed_funded.getSeedRemainder();

        expect(buyer1Address).to.equal(buyer1.address);
        expect(seedAmount).to.equal(seedAmountBought);
        expect(seedRemainder).to.equal(seedRemainderFromContract);
      });
    });
    describe("# when softCap has been reached", () => {
      /**@type {Seed}*/
      let Seed_fundedLowHardCap;
      before(async () => {
        ({ Seed_fundedLowHardCap } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
      });
      it("should update the softCap", async () => {
        expect(await Seed_fundedLowHardCap.getMinimumReached()).to.be.false;
        await Seed_fundedLowHardCap.buy();
        expect(await Seed_fundedLowHardCap.getMinimumReached()).to.be.true;
      });
    });
    describe("# when hardCap has been reached", () => {
      /**@type {Seed}*/
      let Seed_fundedLowHardCap;
      beforeEach(async () => {
        ({ Seed_fundedLowHardCap } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
        await Seed_fundedLowHardCap.buy();
      });
      it("should update the hardCap", async () => {
        const params = {
          from: buyer2,
          fundingAmount: Seed_funded.getFundingAmount("2"),
        };
        expect(await Seed_fundedLowHardCap.getMaximumReached()).to.be.false;
        await Seed_fundedLowHardCap.buy(params);
        expect(await Seed_fundedLowHardCap.getMaximumReached()).to.be.true;
      });
      it("should update the vestingStartTime", async () => {
        const params = {
          from: buyer2,
          fundingAmount: Seed_fundedLowHardCap.getFundingAmount("2"),
        };

        expect(
          (await Seed_fundedLowHardCap.getVestingStartTime()).toNumber()
        ).to.be.within(
          Seed_fundedLowHardCap.endTime + 1, // added plus 1 from the Seed.initialize() call
          Seed_fundedLowHardCap.endTime + 20 // time it takes since the setup
        );

        await Seed_fundedLowHardCap.buy(params);

        expect(await Seed_fundedLowHardCap.getVestingStartTime()).to.equal(
          (await getCurrentTime()).toNumber()
        );
      });
    });
  });
  describe("$ Function: calculateClaimFunder()", () => {});
  describe("$ Function: calculateClaimBeneficiary()", () => {
    /**@type {Seed}*/
    let Seed_funded;
    /**@type {Tip} */
    let tip;
    let tipAmount;
    let vestingDuration;
    let vestingCliff;
    let vestingStartTime;
    let elapsedSeconds;
    let amountVestedDivBySec;
    beforeEach(async () => {
      ({ Seed_funded } = await loadFixture(launchFixture));
      vestingStartTime = await Seed_funded.getVestingStartTime();
      tip = await Seed_funded.getTip();
      tipAmount = tip.tipAmount;
      vestingCliff = tip.vestingCliff;
      vestingDuration = tip.vestingDuration;
    });
    describe("» when vestingStartTime has not been reached", () => {
      it("should return 0", async () => {
        await increaseTime(ONE_DAY);
        const claimableAmount = await Seed_funded.calculateClaimBeneficiary();

        expect(await claimableAmount).to.equal(0);
      });
    });
    describe("» when vestingCliff has not ended", () => {
      it("should return 0", async () => {
        await increaseTimeTo(Seed_funded.endTime + 1);
        const claimableAmount = await Seed_funded.calculateClaimBeneficiary();

        expect(await claimableAmount).to.equal(0);
      });
    });
    describe("» when cliff ended but vestingDuration has not ended yet", () => {
      it("should return right amount", async () => {
        // Claim 1
        // Increase time to after cliff
        await increaseTimeTo(Seed_funded.endTime + 1 + vestingCliff.toNumber());

        elapsedSeconds = BigNumber.from(
          (await getCurrentTime()).toNumber()
        ).sub(BigNumber.from(vestingStartTime));

        // (elapsedSeconds * tipAmount) / vestingDuration
        amountVestedDivBySec = elapsedSeconds
          .mul(tipAmount)
          .div(vestingDuration);

        // Subtract claimable amount from earlier claimed
        const claimableAmount1 = amountVestedDivBySec.sub(tip.totalClaimed);

        const claimableAmountFromContract =
          await Seed_funded.calculateClaimBeneficiary();

        expect(await claimableAmountFromContract).to.equal(claimableAmount1);

        // Claim 2
        await increaseTime(FIVE_DAYS);
        tip = await Seed_funded.getTip();

        elapsedSeconds = BigNumber.from(
          (await getCurrentTime()).toNumber()
        ).sub(BigNumber.from(vestingStartTime));

        // (elapsedSeconds * tipAmount) / vestingDuration
        amountVestedDivBySec = elapsedSeconds
          .mul(tipAmount)
          .div(vestingDuration);

        // Subtract claimable amount from earlier claimed
        const claimableAmount2 = amountVestedDivBySec.sub(tip.totalClaimed);

        const claimableAmountFromContrac2 =
          await Seed_funded.calculateClaimBeneficiary();

        expect(await claimableAmountFromContrac2).to.equal(claimableAmount2);
      });
    });
    describe("» when vestingDuration has ended", () => {
      it("should return right amount", async () => {
        await increaseTimeTo(
          Seed_funded.endTime + 1 + vestingDuration.toNumber()
        );

        elapsedSeconds = BigNumber.from(
          (await getCurrentTime()).toNumber()
        ).sub(BigNumber.from(vestingStartTime));

        // (elapsedSeconds * tipAmount) / vestingDuration
        amountVestedDivBySec = elapsedSeconds
          .mul(tipAmount)
          .div(vestingDuration);

        // Subtract claimable amount from earlier claimed
        const claimableAmount1 = tokenAmountToPrecisionNormalizedFloat(
          amountVestedDivBySec.sub(tip.totalClaimed),
          Seed_funded.seedTokenDecimal
        );

        const claimableAmountFromContract =
          tokenAmountToPrecisionNormalizedFloat(
            await await Seed_funded.calculateClaimBeneficiary(),
            Seed_funded.seedTokenDecimal
          );

        expect(claimableAmountFromContract).to.be.closeTo(
          claimableAmount1,
          0.001
        );
      });
    });
  });
  describe("$ Function: claim()", () => {
    /**@type {Seed}*/
    let Seed_funded;
    before(async () => {
      ({ Seed_funded } = await loadFixture(launchFixture));
      await increaseTime(ONE_DAY);
    });
    describe("# when the softCap has not been reached", () => {
      it("should revert", async () => {
        await expect(Seed_funded.claim()).to.be.revertedWith(
          "Seed: minimum funding amount not met"
        );
      });
    });
    describe("# when the endTime or hardCap has not been reached ", () => {
      /**@type {Seed} */
      let Seed_funded;
      before(async () => {
        ({ Seed_funded } = await loadFixture(launchFixture));
        await increaseTime(ONE_DAY);
        await Seed_funded.buy();
      });
      it("should revert", async () => {
        await expect(Seed_funded.claim()).to.be.revertedWith(
          "Seed: the distribution has not yet finished"
        );
      });
    });
    describe("# given the Seed is not live anymore (endTime or hardCap reached)", () => {
      /**@type {Seed}*/
      let Seed_funded;
      beforeEach(async () => {
        ({ Seed_funded } = await loadFixture(launchFixture));
        await convertSeedToComplete(Seed_funded);
      });
      describe("» when the user has not bought tokens", () => {
        it("should revert", async () => {
          const params = { from: buyer2 };
          await increaseTime(TWENTY_DAYS);

          await expect(Seed_funded.claim(params)).to.be.revertedWith(
            "Seed: amount claimable is 0"
          );
        });
      });
      describe("» when the user want to claim more than is available", () => {
        it("should revert", async () => {
          await increaseTime(TWENTY_DAYS);
          const claimableAmount = await Seed_funded.calculateClaimFunder(
            buyer1
          );
          const toHighAmount = BigNumber.from(claimableAmount).add(
            Seed_funded.getSeedAmount("10")
          );
          const params = {
            claimAmount: toHighAmount,
          };

          await expect(Seed_funded.claim(params)).to.be.revertedWith(
            "Seed: request is greater than claimable amount"
          );
        });
      });
      describe("» when the vesting cliff has not ended", () => {
        it("should revert", async () => {
          await expect(Seed_funded.claim()).to.be.revertedWith(
            "Seed: amount claimable is 0"
          );
        });
      });
      describe("» when the vesting cliff has ended", () => {
        it("should transfer right amount tokens", async () => {
          await increaseTime(TWENTY_DAYS);

          expect(
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address)
          ).to.equal(0);

          const claimableAmount = await Seed_funded.calculateClaimFunder();
          await Seed_funded.claim();

          expect(
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address)
          ).to.equal(claimableAmount);
        });
        it("should emit event", async () => {
          await increaseTime(TWENTY_DAYS);
          const tx = await Seed_funded.claim();
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "TokensClaimed";
          });
          const buyer1Address = event[0].args[0];
          const claimedAmount = event[0].args[1];
          const seedTokenBalance =
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address);

          expect(buyer1Address).to.equal(buyer1.address);
          expect(claimedAmount).to.equal(seedTokenBalance);
        });
      });
      describe("» when the vesting duration has ended", () => {
        it("should transfer all tokens", async () => {
          /**@type {FunderPortfolio}*/
          const funder = await Seed_funded.getFunder(buyer1.address);
          await increaseTime(HUNDRED_DAYS);
          const seedTokenAmount = Seed_funded.getSeedAmountFromFundingAmount(
            funder.fundingAmount
          );

          expect(
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address)
          ).to.equal(0);

          await Seed_funded.claim();

          expect(
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address)
          ).to.equal(seedTokenAmount);
        });
      });
      describe("» when claiming", () => {
        it("should update funders total amount claimed", async () => {
          /**@type {FunderPortfolio}*/
          let funder;
          funder = await Seed_funded.getFunder(buyer1.address);
          await increaseTime(HUNDRED_DAYS);

          expect(funder.totalClaimed).to.equal(0);

          await Seed_funded.claim();
          const seedTokenBalance =
            await Seed_funded.seedTokenInstance.balanceOf(buyer1.address);
          funder = await Seed_funded.getFunder(buyer1.address);

          expect(funder.totalClaimed).to.equal(seedTokenBalance);
        });
      });
    });
  });
  describe("$ Function: claimTip()", () => {
    /**@type {Tip} */
    let tip;
    let tipAmount;
    let totalClaimed;
    let claimableAmount;
    let seedTokenDecimal;
    describe("# when Seed is initialized without tip", () => {
      /** @type {Seed}*/
      let Seed_noTip;
      before(async () => {
        const params = {
          tip: [0, 0, 0],
        };
        Seed_noTip = await SeedBuilder.create();
        await Seed_noTip.initialize(params);
        await fundSignersAndSeed({ Seed: Seed_noTip });
        await increaseTimeTo(Seed_noTip.endTime + 1);
        seedTokenDecimal = Seed_noTip.seedTokenDecimal;
      });
      it("should revert", async () => {
        await expect(Seed_noTip.claimTip()).to.be.revertedWith(
          "Seed: amount claimable is 0"
        );
      });
    });
    describe("# given Seed is initialized with tip", () => {
      /** @type {Seed}*/
      let Seed_withTip;
      describe("» when Seed is not complete yet", () => {
        before(async () => {
          const { Seed_funded } = await loadFixture(launchFixture);
          Seed_withTip = Seed_funded;
        });
        it("should revert", async () => {
          await expect(Seed_withTip.claimTip()).to.be.revertedWith(
            "Seed: the distribution has not yet finished"
          );
        });
      });
      describe("» when Seed tip vestingCliff hasn't ended", () => {
        before(async () => {
          const { Seed_funded } = await loadFixture(launchFixture);
          Seed_withTip = Seed_funded;
        });
        it("should revert", async () => {
          await increaseTimeTo(Seed_withTip.endTime); //  EndTime reached
          await increaseTime(FIVE_DAYS); // Half of cliff

          await expect(Seed_withTip.claimTip()).to.be.revertedWith(
            "Seed: amount claimable is 0"
          );
        });
      });
      describe("» when claiming (Seed Complete)", () => {
        beforeEach(async () => {
          const { Seed_funded } = await loadFixture(launchFixture);
          Seed_withTip = Seed_funded;
          await increaseTimeTo(Seed_withTip.startTime);
          await Seed_withTip.buy();
          await increaseTime(FOURTY_DAYS);
          seedTokenDecimal = Seed_withTip.seedTokenDecimal;
        });
        it("should update tip claimed amount and beneficiary SeedToken balance", async () => {
          // Claim first time
          tip = await Seed_withTip.getTip();
          tipAmount = tip.tipAmount;

          expect(tip.totalClaimed).to.equal(0);
          expect(
            await Seed_withTip.seedTokenInstance.balanceOf(beneficiary.address)
          ).to.equal(0);

          // Convert claimable amount from precision of SeedToken to float
          claimableAmount = tokenAmountToPrecisionNormalizedFloat(
            await Seed_withTip.calculateClaimBeneficiary(),
            seedTokenDecimal
          );

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          // Convert totalClamed  from precision of SeedToken to float
          totalClaimed = tokenAmountToPrecisionNormalizedFloat(
            tip.totalClaimed,
            seedTokenDecimal
          );

          expect(totalClaimed).to.be.closeTo(
            claimableAmount,
            0.0001 // Delta
          );

          const beneficiaryBalanceClaim1 =
            tokenAmountToPrecisionNormalizedFloat(
              await Seed_withTip.seedTokenInstance.balanceOf(
                beneficiary.address
              ),
              seedTokenDecimal
            );

          expect(beneficiaryBalanceClaim1).to.equal(totalClaimed);

          // Claim second time
          const currentTotalClaimed = totalClaimed;
          await increaseTime(TWENTY_DAYS);
          claimableAmount = tokenAmountToPrecisionNormalizedFloat(
            await Seed_withTip.calculateClaimBeneficiary(),
            seedTokenDecimal
          );

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          // Convert totalClamed  from precision of SeedToken to float
          totalClaimed = tokenAmountToPrecisionNormalizedFloat(
            tip.totalClaimed,
            seedTokenDecimal
          );

          expect(totalClaimed).to.be.closeTo(
            claimableAmount + currentTotalClaimed,
            0.0001 // Delta
          );

          const beneficiaryBalanceClaim2 =
            tokenAmountToPrecisionNormalizedFloat(
              await Seed_withTip.seedTokenInstance.balanceOf(
                beneficiary.address
              ),
              seedTokenDecimal
            );
          expect(beneficiaryBalanceClaim2).to.be.closeTo(
            claimableAmount + currentTotalClaimed,
            0.0001 // Delta
          );
        });
        it("should emit the right amount in event", async () => {
          tip = await Seed_withTip.getTip();

          expect(tip.totalClaimed).to.equal(0);

          // Get event
          const tx = await expect(Seed_withTip.claimTip()).to.not.be.reverted;
          const receipt = await tx.wait();
          const event = receipt.events.filter((x) => {
            return x.event == "TipClaimed";
          });

          tip = await Seed_withTip.getTip();
          const totalClaimedFromEvent = event[0].args[0];

          expect(tip.totalClaimed.toString()).to.equal(
            totalClaimedFromEvent.toString()
          );
        });
      });
      describe("» when claiming (Seed Incomplete", () => {
        beforeEach(async () => {
          const { Seed_funded } = await loadFixture(launchFixture);
          Seed_withTip = Seed_funded;
          await increaseTime(FOURTY_DAYS);
          seedTokenDecimal = Seed_withTip.seedTokenDecimal;
        });
        it("should update tip claimed amount and beneficiary SeedToken balance", async () => {
          // Claim first time
          tip = await Seed_withTip.getTip();
          tipAmount = tip.tipAmount;

          expect(tip.totalClaimed).to.equal(0);
          expect(
            await Seed_withTip.seedTokenInstance.balanceOf(beneficiary.address)
          ).to.equal(0);

          // Convert claimable amount from precision of SeedToken to float
          claimableAmount = tokenAmountToPrecisionNormalizedFloat(
            await Seed_withTip.calculateClaimBeneficiary(),
            seedTokenDecimal
          );

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          // Convert totalClamed  from precision of SeedToken to float
          totalClaimed = tokenAmountToPrecisionNormalizedFloat(
            tip.totalClaimed,
            seedTokenDecimal
          );

          expect(totalClaimed).to.be.closeTo(
            claimableAmount,
            0.0001 // Delta
          );

          const beneficiaryBalanceClaim1 =
            tokenAmountToPrecisionNormalizedFloat(
              await Seed_withTip.seedTokenInstance.balanceOf(
                beneficiary.address
              ),
              seedTokenDecimal
            );

          expect(beneficiaryBalanceClaim1).to.equal(totalClaimed);

          // Claim second time
          const currentTotalClaimed = totalClaimed;
          await increaseTime(TWENTY_DAYS);
          claimableAmount = tokenAmountToPrecisionNormalizedFloat(
            await Seed_withTip.calculateClaimBeneficiary(),
            seedTokenDecimal
          );

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          // Convert totalClamed  from precision of SeedToken to float
          totalClaimed = tokenAmountToPrecisionNormalizedFloat(
            tip.totalClaimed,
            seedTokenDecimal
          );

          expect(totalClaimed).to.be.closeTo(
            claimableAmount + currentTotalClaimed,
            0.0001 // Delta
          );

          const beneficiaryBalanceClaim2 =
            tokenAmountToPrecisionNormalizedFloat(
              await Seed_withTip.seedTokenInstance.balanceOf(
                beneficiary.address
              ),
              seedTokenDecimal
            );
          expect(beneficiaryBalanceClaim2).to.be.closeTo(
            claimableAmount + currentTotalClaimed,
            0.0001 // Delta
          );
        });
      });
      describe("» when initialized without cliff", () => {
        before(async () => {
          const params = {
            tip: [parseEther("0.02").toString(), 0, TEN_DAYS.toNumber()],
          };
          Seed_withTip = await SeedBuilder.create();
          await Seed_withTip.initialize(params);
          await fundSignersAndSeed({ Seed: Seed_withTip });
        });
        it("should start counting duration after Seed complete", async () => {
          await increaseTimeTo(Seed_withTip.endTime + 1); // increase to endTime

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;
          await expect(Seed_withTip.claimTip()).to.not.be.reverted;
        });
      });
      describe("» when initialized without duration", () => {
        before(async () => {
          const params = {
            tip: [parseEther("0.02").toString(), TEN_DAYS.toNumber(), 0],
          };
          Seed_withTip = await SeedBuilder.create();
          await Seed_withTip.initialize(params);
          await fundSignersAndSeed({ Seed: Seed_withTip });
        });
        it("should claim full amount after cliff", async () => {
          tip = await Seed_withTip.getTip();
          tipAmount = tip.tipAmount;
          await increaseTimeTo(
            Seed_withTip.endTime + Seed_withTip.tipVestingCliff
          );

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          expect(tip.totalClaimed).to.equal(tipAmount);
        });
      });
      describe("» when initialized without cliff and duration", () => {
        before(async () => {
          const params = {
            tip: [parseEther("0.02").toString(), 0, 0],
          };
          Seed_withTip = await SeedBuilder.create();
          await Seed_withTip.initialize(params);
          await fundSignersAndSeed({ Seed: Seed_withTip });
        });
        it("should claim full amount when Seed complete", async () => {
          tip = await Seed_withTip.getTip();
          tipAmount = tip.tipAmount;
          await increaseTimeTo(Seed_withTip.endTime);

          await expect(Seed_withTip.claimTip()).to.not.be.reverted;

          tip = await Seed_withTip.getTip();
          expect(tip.totalClaimed).to.equal(tipAmount);
        });
      });
    });
  });
  describe("$ Function: retrieveSeedTokens()", () => {});
  describe("$ Function: retrieveFundingTokens()", () => {});
  describe("$ Function: pause()", () => {
    // Will be found in other tests
  });
  describe("$ Function: unpause()", () => {});
  describe("$ Function: close()", () => {});
  describe("$ Function: whitelistBatch()", () => {});
  describe("$ Function: unwhitelist()", () => {});
  describe("$ Function: withdraw()", () => {});
  describe("$ Function: updateMetadata()", () => {});
  describe("$ Function: seedAmountForFunder()", () => {});
});