const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, expectRevert, BN } = require("@openzeppelin/test-helpers");
const {
  utils: { parseEther, parseUnits },
  BigNumber,
} = ethers;

const init = require("./test-init.js");

const deploy = async () => {
  const setup = await init.initialize(await ethers.getSigners());

  setup.seed = await init.getContractInstance("Seed", setup.roles.prime);

  setup.token = await init.gettokenInstances(setup);

  setup.data = {};

  return setup;
};

const getDecimals = async (token) => await token.decimals();

const getTokenAmount = (tokenDecimal) => (amount) =>
  parseUnits(amount, tokenDecimal.toString());

describe("Contract: Seed", async () => {
  let setup;
  let root;
  let admin;
  let buyer1;
  let buyer2;
  let buyer3;
  let buyer4;
  let seedToken;
  let seedTokenDecimal;
  let getSeedAmounts;
  let fundingToken;
  let fundingTokenDecimal;
  let getFundingAmounts;
  let softCap;
  let hardCap;
  let price;
  let buyAmount;
  let smallBuyAmount;
  let buySeedAmount;
  let buySeedFee;
  let startTime;
  let endTime;
  let vestingDuration;
  let vestingCliff;
  let permissionedSeed;
  let fee;
  let seed;
  let metadata;
  let seedForDistribution;
  let seedForFee;
  let requiredSeedAmount;
  let claimAmount;
  let feeAmount;
  let totalClaimedByBuyer1;
  let seedAmount;
  let feeAmountOnClaim;

  // constants
  const zero = 0;
  const one = 1;
  const hundred = 100;
  const tenETH = parseEther("10").toString();
  const hundredTwoETH = parseEther("102").toString();
  const twoHundredFourETH = parseEther("204").toString();
  const hundredBn = new BN(100);
  const twoBN = new BN(2);
  const PRECISION = ethers.constants.WeiPerEther;
  const ninetyTwoDaysInSeconds = time.duration.days(92);
  const eightyNineDaysInSeconds = time.duration.days(89);
  const tenDaysInSeconds = time.duration.days(10);

  context("» creator is avatar", () => {
    before("!! setup", async () => {
      setup = await deploy();

      const CustomDecimalERC20Mock = await ethers.getContractFactory(
        "CustomDecimalERC20Mock",
        setup.roles.root
      );

      // Tokens used
      // fundingToken = setup.token.fundingToken;
      fundingToken = await CustomDecimalERC20Mock.deploy("USDC", "USDC", 16);
      fundingTokenDecimal = (await getDecimals(fundingToken)).toString();
      getFundingAmounts = getTokenAmount(fundingTokenDecimal);

      // seedToken = setup.token.seedToken;
      seedToken = await CustomDecimalERC20Mock.deploy("Prime", "Prime", 12);
      seedTokenDecimal = (await getDecimals(seedToken)).toString();
      getSeedAmounts = getTokenAmount(seedTokenDecimal);

      // // Roles
      root = setup.roles.root;
      beneficiary = setup.roles.beneficiary;
      admin = setup.roles.prime;
      buyer1 = setup.roles.buyer1;
      buyer2 = setup.roles.buyer2;
      buyer3 = setup.roles.buyer3;

      // // Parameters to initialize seed contract
      softCap = getFundingAmounts("10").toString();
      hardCap = getFundingAmounts("102").toString();
      price = parseUnits(
        "0.01",
        parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
      ).toString();
      buyAmount = getFundingAmounts("51").toString();
      smallBuyAmount = getFundingAmounts("9").toString();
      buySeedAmount = getSeedAmounts("5100").toString();
      startTime = await time.latest();
      endTime = await startTime.add(await time.duration.days(7));
      vestingDuration = time.duration.days(365); // 1 year
      vestingCliff = time.duration.days(90); // 3 months
      permissionedSeed = false;
      fee = parseEther("0.02").toString(); // 2%
      metadata = `0x`;

      buySeedFee = new BN(buySeedAmount)
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      seedForDistribution = new BN(hardCap)
        .mul(new BN(PRECISION.toString()))
        .div(new BN(price));
      seedForFee = seedForDistribution
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      requiredSeedAmount = seedForDistribution.add(seedForFee);
    });
    context("» contract is not initialized yet", () => {
      context("» parameters are valid", () => {
        context("» distribution period not yet started", () => {
          it("is not possible to buy", async () => {
            const alternativeSetup = await deploy();
            await alternativeSetup.seed.initialize(
              beneficiary.address,
              admin.address,
              [seedToken.address, fundingToken.address],
              [softCap, hardCap],
              price,
              (await startTime.add(await time.duration.days(2))).toNumber(),
              endTime.toNumber(),
              vestingDuration.toNumber(),
              vestingCliff.toNumber(),
              permissionedSeed,
              fee
            );
            const signers = await ethers.getSigners();
            const randomSigner = signers[9];
            await expectRevert(
              alternativeSetup.seed
                .connect(randomSigner)
                .buy(getFundingAmounts("1").add(buyAmount)),
              "Seed: only allowed during distribution period"
            );
          });
        });

        it("it initializes seed", async () => {
          // emulate creation & initialization via seedfactory & fund with seedTokens

          await setup.seed.initialize(
            beneficiary.address,
            admin.address,
            [seedToken.address, fundingToken.address],
            [softCap, hardCap],
            price,
            startTime.toNumber(),
            endTime.toNumber(),
            vestingDuration.toNumber(),
            vestingCliff.toNumber(),
            permissionedSeed,
            fee
          );

          expect(await setup.seed.initialized()).to.equal(true);
          expect(await setup.seed.beneficiary()).to.equal(beneficiary.address);
          expect(await setup.seed.admin()).to.equal(admin.address);
          expect(await setup.seed.seedToken()).to.equal(seedToken.address);
          expect(await setup.seed.fundingToken()).to.equal(
            fundingToken.address
          );
          expect((await setup.seed.softCap()).toString()).to.equal(
            softCap.toString()
          );
          expect((await setup.seed.price()).toString()).to.equal(
            price.toString()
          );
          expect(await setup.seed.permissionedSeed()).to.equal(
            permissionedSeed
          );
          expect((await setup.seed.fee()).toString()).to.equal(fee.toString());
          expect(await setup.seed.closed()).to.equal(false);
          expect((await setup.seed.seedAmountRequired()).toString()).to.equal(
            seedForDistribution.toString()
          );
          expect((await setup.seed.feeAmountRequired()).toString()).to.equal(
            seedForFee.toString()
          );
          expect((await setup.seed.seedRemainder()).toString()).to.equal(
            seedForDistribution.toString()
          );
          expect((await setup.seed.feeRemainder()).toString()).to.equal(
            seedForFee.toString()
          );
          expect((await setup.seed.isFunded()).toString()).to.equal("false");
        });
        it("it adds class", () => {
          context("» generics", () => {
            it("it adds Customer class", async () => {
              await setup.seed
                  .connect(admin)
                  .addClass(1e14, 1e12, 1e12, 10000000);
              expect(
                  (await setup.seed.getClass(0))[0]
              ).to.equal((ethers.BigNumber.from(1e14)));
            });
          });
        });
        it("it adds Batch of Class", () => {
          context("» generics", () => {
            it("it adds Customer class", async () => {
              await setup.seed
                  .connect(admin)
                  .addClassBatch([1e14,1e12], [1e12,1e6], [1e12,1e6], [10000000,10000]);
              expect(
                  (await setup.seed.getClass(2))[0]
              ).to.equal((ethers.BigNumber.from(1e12)));
            });
          });
        });
        it("it reverts on double initialization", async () => {
          await expectRevert(
            setup.seed.initialize(
              beneficiary.address,
              admin.address,
              [seedToken.address, fundingToken.address],
              [softCap, hardCap],
              price,
              startTime.toNumber(),
              endTime.toNumber(),
              vestingDuration.toNumber(),
              vestingCliff.toNumber(),
              permissionedSeed,
              fee
            ),
            "Seed: contract already initialized"
          );
        });
        it("reverts when trying to add/remove whitelist", async () => {
          await expectRevert(
            setup.seed
              .connect(admin)
              .whitelistBatch([buyer1.address, buyer2.address]),
            "Seed: seed is not whitelisted"
          );
          await expectRevert(
            setup.seed.connect(admin).unwhitelist(buyer1.address),
            "Seed: seed is not whitelisted"
          );
        });
        it("it reverts when trying to add batch of Class", () => {
          context("» generics", () => {
            it("it adds Customer class", async () => {
              await expectRevert(
                  setup.seed
                  .connect(admin)
                  .addClassBatch([1e14,1e12], [1e12], [1e12,1e6], [10000000,10000]),
                  "Seed: All provided arrays should be same size");
            });
          });
        });
      });
    });
  });
  context("creator is avatar -- whitelisted contract", () => {
    before("!! deploy setup", async () => {
      setup = await deploy();

      // Tokens used
      fundingToken = setup.token.fundingToken;
      fundingTokenDecimal = await getDecimals(fundingToken);
      getFundingAmounts = getTokenAmount(fundingTokenDecimal);

      seedToken = setup.token.seedToken;
      seedTokenDecimal = await getDecimals(seedToken);
      getSeedAmounts = getTokenAmount(seedTokenDecimal);

      // // Roles
      root = setup.roles.root;
      beneficiary = setup.roles.beneficiary;
      admin = setup.roles.prime;
      buyer1 = setup.roles.buyer1;
      buyer2 = setup.roles.buyer2;
      buyer3 = setup.roles.buyer3;
      buyer4 = setup.roles.buyer3;

      // // Parameters to initialize seed contract
      softCap = getFundingAmounts("10").toString();
      hardCap = getFundingAmounts("102").toString();
      price = parseUnits(
        "0.01",
        parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
      ).toString();
      buyAmount = getFundingAmounts("51").toString();
      startTime = await time.latest();
      endTime = await startTime.add(await time.duration.days(7));
      vestingDuration = time.duration.days(365); // 1 year
      vestingCliff = time.duration.days(90); // 3 months
      permissionedSeed = true;
      fee = parseEther("0.02").toString(); // 2%

      seedForDistribution = new BN(hardCap)
        .div(new BN(price))
        .mul(new BN(PRECISION.toString()));
      seedForFee = seedForDistribution
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      requiredSeedAmount = seedForDistribution.add(seedForFee);
    });
    context("» contract is not initialized yet", () => {
      context("» parameters are valid", () => {
        before("!! deploy new contract", async () => {
          seed = await init.getContractInstance("Seed", setup.roles.prime);
          setup;
        });
        it("initializes", async () => {
          // emulate creation & initialization via seedfactory & fund with seedTokens
          await seedToken
            .connect(root)
            .transfer(seed.address, requiredSeedAmount.toString());

          await seed.initialize(
            beneficiary.address,
            admin.address,
            [seedToken.address, fundingToken.address],
            [softCap, hardCap],
            price,
            startTime.toNumber(),
            endTime.toNumber(),
            vestingDuration.toNumber(),
            vestingCliff.toNumber(),
            permissionedSeed,
            fee
          );
          expect(await seed.initialized()).to.equal(true);
          expect(await seed.beneficiary()).to.equal(beneficiary.address);
          expect(await seed.admin()).to.equal(admin.address);
          expect(await seed.seedToken()).to.equal(seedToken.address);
          expect(await seed.fundingToken()).to.equal(fundingToken.address);
          expect((await seed.softCap()).toString()).to.equal(softCap);
          expect((await seed.price()).toString()).to.equal(price);
          expect(await seed.permissionedSeed()).to.equal(permissionedSeed);
          expect((await seed.fee()).toString()).to.equal(fee.toString());
          expect(await seed.closed()).to.equal(false);
          expect((await seed.seedAmountRequired()).toString()).to.equal(
            seedForDistribution.toString()
          );
          expect((await seed.feeAmountRequired()).toString()).to.equal(
            seedForFee.toString()
          );
          expect((await seed.seedRemainder()).toString()).to.equal(
            seedForDistribution.toString()
          );
          expect((await seed.feeRemainder()).toString()).to.equal(
            seedForFee.toString()
          );
          expect((await seedToken.balanceOf(seed.address)).toString()).to.equal(
            requiredSeedAmount.toString()
          );
        });
        it("it reverts on double initialization", async () => {
          await expectRevert(
            seed.initialize(
              beneficiary.address,
              admin.address,
              [seedToken.address, fundingToken.address],
              [softCap, hardCap],
              price,
              startTime.toNumber(),
              endTime.toNumber(),
              vestingDuration.toNumber(),
              vestingCliff.toNumber(),
              permissionedSeed,
              fee
            ),
            "Seed: contract already initialized"
          );
        });
      });
    });
    context("# admin whitelist functions", () => {
      context("» whitelist", () => {
        it("adds a user to the whitelist", async () => {
          expect(await seed.whitelisted(buyer1.address)).to.equal(false);
          await seed.connect(admin).whitelist(buyer1.address);
          expect(await seed.whitelisted(buyer1.address)).to.equal(true);
        });
      });
      context("» unwhitelist", () => {
        it("removes a user from the whitelist", async () => {
          expect(await seed.whitelisted(buyer1.address)).to.equal(true);
          await seed.connect(admin).unwhitelist(buyer1.address);
          expect(await seed.whitelisted(buyer1.address)).to.equal(false);
        });
        it("reverts when unwhitelist account buys", async () => {
          await expectRevert(
            seed.connect(buyer1).buy(getFundingAmounts("1").toString()),
            "Seed: sender has no rights"
          );
        });
      });
      context("» whitelistBatch", () => {
        context("seed is closed", async () => {
          it("reverts: 'Seed: should not be closed'", async () => {
            const newStartTime = await time.latest();
            const newEndTime = await newStartTime.add(
              await time.duration.days(7)
            );

            const alternativeSeed = await init.getContractInstance(
              "Seed",
              setup.roles.prime
            );
            setup;
            await seedToken
              .connect(root)
              .transfer(alternativeSeed.address, requiredSeedAmount.toString());

            alternativeSeed.initialize(
              beneficiary.address,
              admin.address,
              [seedToken.address, fundingToken.address],
              [softCap, hardCap],
              price,
              newStartTime.toNumber(),
              newEndTime.toNumber(),
              vestingDuration.toNumber(),
              vestingCliff.toNumber(),
              permissionedSeed,
              fee
            );
            await time.increase(tenDaysInSeconds);
            await alternativeSeed.close();
            await expectRevert(
              alternativeSeed
                .connect(admin)
                .whitelistBatch([buyer1.address, buyer2.address]),
              "Seed: should not be closed"
            );
          });
        });
        it("can only be called by admin", async () => {
          await expectRevert(
            seed
              .connect(buyer1)
              .whitelistBatch([buyer1.address, buyer2.address]),
            "Seed: caller should be admin"
          );
        });
        it("adds users to the whitelist", async () => {
          expect(await seed.whitelisted(buyer3.address)).to.equal(false);
          expect(await seed.whitelisted(buyer4.address)).to.equal(false);

          await seed
            .connect(admin)
            .whitelistBatch([buyer3.address, buyer4.address]);

          expect(await seed.whitelisted(buyer3.address)).to.equal(true);
          expect(await seed.whitelisted(buyer4.address)).to.equal(true);
          expect(await seed.isWhitelistBatchInvoked()).to.equal(true);
        });
      });
    });
    context("# hardCap", () => {
      context("» check hardCap", () => {
        it("cannot buy more than hardCap", async () => {
          const newStartTime = await time.latest();
          const newEndTime = await newStartTime.add(
            await time.duration.days(7)
          );
          const alternativeSetup = await deploy();
          await alternativeSetup.seed.initialize(
            beneficiary.address,
            admin.address,
            [seedToken.address, fundingToken.address],
            [softCap, hardCap],
            price,
            newStartTime.toNumber(),
            newEndTime.toNumber(),
            vestingDuration.toNumber(),
            vestingCliff.toNumber(),
            permissionedSeed,
            fee
          );
          await seedToken
            .connect(root)
            .transfer(
              alternativeSetup.seed.address,
              requiredSeedAmount.toString()
            );
          await fundingToken
            .connect(root)
            .transfer(buyer2.address, getFundingAmounts("102"));
          await fundingToken
            .connect(buyer2)
            .approve(alternativeSetup.seed.address, getFundingAmounts("102"));
          await alternativeSetup.seed.connect(admin).whitelist(buyer2.address);
          await alternativeSetup.seed
            .connect(buyer2)
            .buy(getFundingAmounts("102"));
          await expectRevert(
            alternativeSetup.seed.connect(buyer2).buy(twoHundredFourETH),
            "Seed: maximum funding reached"
          );
        });
      });
    });
  });
  context("» price test of tokens with decimals 6", () => {
    before("!! setup", async () => {
      setup = await deploy();

      const CustomDecimalERC20Mock = await ethers.getContractFactory(
        "CustomDecimalERC20Mock",
        setup.roles.root
      );

      // Tokens used
      fundingToken = await CustomDecimalERC20Mock.deploy("USDC", "USDC", 6);
      fundingTokenDecimal = await getDecimals(fundingToken);
      getFundingAmounts = getTokenAmount(fundingTokenDecimal);

      seedToken = setup.token.seedToken;
      seedTokenDecimal = await getDecimals(seedToken);
      getSeedAmounts = getTokenAmount(seedTokenDecimal);

      // // Roles
      root = setup.roles.root;
      beneficiary = setup.roles.beneficiary;
      admin = setup.roles.prime;
      buyer1 = setup.roles.buyer1;
      buyer2 = setup.roles.buyer2;
      buyer3 = setup.roles.buyer3;

      // // Parameters to initialize seed contract
      softCap = getFundingAmounts("10").toString();
      hardCap = getFundingAmounts("102").toString();
      buyAmount = getFundingAmounts("51").toString();
      smallBuyAmount = getFundingAmounts("9").toString();
      buySeedAmount = getSeedAmounts("5100").toString();
      price = parseUnits(
        "1",
        parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
      ).toString();
      startTime = await time.latest();
      endTime = await startTime.add(await time.duration.days(7));
      vestingDuration = time.duration.days(365); // 1 year
      vestingCliff = time.duration.days(90); // 3 months
      permissionedSeed = false;
      fee = parseEther("0.02").toString(); // 2%
      metadata = `0x`;

      buySeedFee = new BN(buySeedAmount)
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      seedForDistribution = new BN(hardCap)
        .mul(new BN(PRECISION.toString()))
        .div(new BN(price));
      seedForFee = seedForDistribution
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      requiredSeedAmount = seedForDistribution.add(seedForFee);

      await setup.seed.initialize(
        beneficiary.address,
        admin.address,
        [seedToken.address, fundingToken.address],
        [softCap, hardCap],
        price,
        startTime.toNumber(),
        endTime.toNumber(),
        vestingDuration.toNumber(),
        vestingCliff.toNumber(),
        permissionedSeed,
        fee
      );
      await fundingToken
        .connect(root)
        .transfer(buyer1.address, getFundingAmounts("102"));
      await fundingToken
        .connect(buyer1)
        .approve(setup.seed.address, getFundingAmounts("102"));

      claimAmount = new BN(ninetyTwoDaysInSeconds).mul(
        new BN(buySeedAmount).mul(new BN(twoBN)).div(new BN(vestingDuration))
      );
      feeAmount = new BN(claimAmount)
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      await seedToken
        .connect(root)
        .transfer(setup.seed.address, requiredSeedAmount.toString());
    });
    it("$ buys with one funding token", async () => {
      const oneFundingTokenAmount = getFundingAmounts("1");
      await fundingToken
        .connect(buyer1)
        .approve(setup.seed.address, oneFundingTokenAmount);
      await setup.seed.connect(buyer1).buy(oneFundingTokenAmount);
      const expectedSeedAmount = oneFundingTokenAmount
        .mul(PRECISION)
        .div(BigNumber.from(price));
      expect(
        (await setup.seed.seedAmountForFunder(buyer1.address)).eq(
          expectedSeedAmount
        )
      ).to.be.true;
    });
  });
  context("» price test of both tokens with decimals 6", () => {
    before("!! setup", async () => {
      setup = await deploy();

      // Tokens used
      const CustomDecimalERC20Mock = await ethers.getContractFactory(
        "CustomDecimalERC20Mock",
        setup.roles.root
      );
      fundingToken = await CustomDecimalERC20Mock.deploy("USDC", "USDC", 6);
      fundingTokenDecimal = await getDecimals(fundingToken);
      getFundingAmounts = getTokenAmount(fundingTokenDecimal);

      seedToken = await CustomDecimalERC20Mock.deploy("Prime", "Prime", 6);
      seedTokenDecimal = await getDecimals(seedToken);
      getSeedAmounts = getTokenAmount(seedTokenDecimal);

      // // Roles
      root = setup.roles.root;
      beneficiary = setup.roles.beneficiary;
      admin = setup.roles.prime;
      buyer1 = setup.roles.buyer1;
      buyer2 = setup.roles.buyer2;
      buyer3 = setup.roles.buyer3;

      // // Parameters to initialize seed contract
      softCap = getFundingAmounts("10").toString();
      hardCap = getFundingAmounts("102").toString();
      buyAmount = getFundingAmounts("51").toString();
      smallBuyAmount = getFundingAmounts("9").toString();
      buySeedAmount = getSeedAmounts("5100", seedTokenDecimal).toString();
      price = parseUnits(
        "1",
        parseInt(fundingTokenDecimal) - parseInt(seedTokenDecimal) + 18
      ).toString();
      startTime = await time.latest();
      endTime = await startTime.add(await time.duration.days(7));
      vestingDuration = time.duration.days(365); // 1 year
      vestingCliff = time.duration.days(90); // 3 months
      permissionedSeed = false;
      fee = parseEther("0.02").toString(); // 2%
      metadata = `0x`;

      buySeedFee = new BN(buySeedAmount)
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      seedForDistribution = new BN(hardCap)
        .mul(new BN(PRECISION.toString()))
        .div(new BN(price));
      seedForFee = seedForDistribution
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      requiredSeedAmount = seedForDistribution.add(seedForFee);

      await setup.seed.initialize(
        beneficiary.address,
        admin.address,
        [seedToken.address, fundingToken.address],
        [softCap, hardCap],
        price,
        startTime.toNumber(),
        endTime.toNumber(),
        vestingDuration.toNumber(),
        vestingCliff.toNumber(),
        permissionedSeed,
        fee
      );
      await fundingToken
        .connect(root)
        .transfer(buyer1.address, getFundingAmounts("102"));
      await fundingToken
        .connect(buyer1)
        .approve(setup.seed.address, getFundingAmounts("102"));

      claimAmount = new BN(ninetyTwoDaysInSeconds).mul(
        new BN(buySeedAmount).mul(new BN(twoBN)).div(new BN(vestingDuration))
      );
      feeAmount = new BN(claimAmount)
        .mul(new BN(fee))
        .div(new BN(PRECISION.toString()));
      await seedToken
        .connect(root)
        .transfer(admin.address, requiredSeedAmount.toString());
      await seedToken
        .connect(admin)
        .transfer(setup.seed.address, requiredSeedAmount.toString());
    });
    it("$ buys with one funding token", async () => {
      const oneFundingTokenAmount = getFundingAmounts("100");
      await fundingToken
        .connect(buyer1)
        .approve(setup.seed.address, oneFundingTokenAmount);
      await setup.seed.connect(buyer1).buy(oneFundingTokenAmount);
      const expectedSeedAmount = oneFundingTokenAmount
        .mul(PRECISION)
        .div(BigNumber.from(price));
      expect(
        (await setup.seed.seedAmountForFunder(buyer1.address)).eq(
          expectedSeedAmount
        )
      ).to.be.true;
    });
  });
});
