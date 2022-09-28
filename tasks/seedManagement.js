var { task } = require("hardhat/config");
var { SeedArguments } = require("../test/args/seed-test-args.json");

// async function createSeed() {
//   console.log("Creating Seed...");

//   var provider = await ethers.getDefaultProvider("http://localhost:8545")

//   var hre = {
//     ethers
//   }
//   // var seedFactoryInstance = await hre.ethers.getContract("SeedFactory");
//   var seedFactoryInstance = await hre.ethers.getContractAt("SeedFactory", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

//   console.log('------------------------------------------------------------------------------------------')
//   console.log('------------------------------------------------------------------------------------------')
//   console.log('------------------------------------------------------------------------------------------')
//   var tx = await seedFactoryInstance.deploySeed(
//   // contract.deploySeed(
//     SeedArguments.BENEFICIARY,
//     SeedArguments.ADMIN,
//     [SeedArguments.TD2D, SeedArguments.TUSDC],
//     [SeedArguments.softCap, SeedArguments.hardCap],
//     SeedArguments.price,
//     SeedArguments.startTime,
//     SeedArguments.endTime,
//     [SeedArguments.vestingDuration, SeedArguments.vestingCliff],
//     SeedArguments.isPermissioned,
//     SeedArguments.fee,
//     SeedArguments.metadata
//   );
//   console.log(JSON.stringify(tx, null, 2))
//   console.log(`Seed created through tx ${tx.hash}`);
//   var receipt = await tx.wait();
//   console.log('------------------------------------------------------------------------------------------')
//   console.log('------------------------------------------------------------------------------------------')
//   console.log(JSON.stringify(receipt, null, 2))
//   console.log("Seed deployed");

//   var filter = seedFactoryInstance.filter.SeedCreated();
//   var result = seedFactoryInstance.queryFilter(filter)
//   /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 43 ~ result', result)
// }

// createSeed()

// Arguments for creating a Seed are taken from "../test/args/seed-test-args.json"
task("createSeed", "Creates a Seed directly, bypassing Gnosis safe").setAction(
  async (_, hre) => {
    try {
      console.log("Creating Seed...");
      var seedFactoryInstance = await hre.ethers.getContract("SeedFactory");
      // var seedFactoryInstance = await hre.ethers.getContractAt("SeedFactory", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
      seedFactoryInstance.address
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 55 ~ seedFactoryInstance.address', seedFactoryInstance.address)
      console.log('------------------------------------------------------------------------------------------')
      console.log('------------------------------------------------------------------------------------------')
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 60 ~ SeedArguments.BENEFICIARY', SeedArguments.BENEFICIARY)
      var tx = await seedFactoryInstance.deploySeed(
        SeedArguments.BENEFICIARY,
        SeedArguments.ADMIN,
        [SeedArguments.cUSD, SeedArguments.TUSDC],
        [SeedArguments.softCap, SeedArguments.hardCap],
        SeedArguments.price,
        SeedArguments.startTime,
        SeedArguments.endTime,
        [SeedArguments.vestingDuration, SeedArguments.vestingCliff],
        SeedArguments.isPermissioned,
        SeedArguments.fee,
        SeedArguments.metadata
      );
      // console.log(JSON.stringify(tx, null, 2))
      console.log(`Seed created through tx ${tx.hash}`);
      var receipt = await tx.wait();
      // console.log('------------------------------------------------------------------------------------------')
      // console.log('------------------------------------------------------------------------------------------')
      // console.log(JSON.stringify(receipt, null, 2))
      // console.log("Seed deployed");

      var filter = seedFactoryInstance.filters.SeedCreated();
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 80 ~ filter', filter)
      var result = await seedFactoryInstance.queryFilter(filter)
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 82 ~ result', result)

    } catch (error) {
      console.log(error);
    }
  }
);

task("changeOwner", "changes owner of SeedFactory")
  .addParam("address", "new owner address", undefined)
  .setAction(async ({ address }, { ethers }) => {
    try {
      console.log(`changing owner of SeedFactory to ${address}`);
      var seedFactoryInstance = await ethers.getContract("SeedFactory");
      var tx = await seedFactoryInstance.transferOwnership(address);
      console.log("Transaction:", tx.hash);
    } catch (error) {
      console.log(error);
    }
  });
