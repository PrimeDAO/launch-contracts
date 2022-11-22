var { SeedArguments } = require("../lib/params/seed-test-args.json");
const hre = require("hardhat");
const { getNamedAccounts, deployments, ethers } = hre;

async function token(name, tokenAddress) {
  var D2DInstance = await ethers.getContractAt(
    "D2D",
    "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"
  );
  D2DInstance.populateTransaction.balanceOf(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  ); /*?*/
  const result = await D2DInstance.balanceOf(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  ); /*?*/
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: testMgmt.js ~ line 14 ~ result', result)
}

// token();

async function createSeed() {
  const seedFactoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  var seedFactoryInstance = await ethers.getContractAt(
    "SeedFactory",
    seedFactoryAddress
  );

  const readonlyEndPoint = "HTTP://127.0.0.1:8545";
  const provider = ethers.getDefaultProvider(readonlyEndPoint);

  const jsonSigner = provider.getSigner();

  // signerOrProvider = jsonSigner.getSigner();

  // const signer = (await hre.ethers.getSigners())[0];

  const SeedFactoryContract = new ethers.Contract(
    seedFactoryAddress,
    seedFactoryInstance.interface,
    jsonSigner
  );

  // var tx = await seedFactoryInstance.populateTransaction.deploySeed(
  var tx = await SeedFactoryContract.deploySeed(
    // var tx = await seedFactoryInstance.deploySeed(
    SeedArguments.BENEFICIARY,
    SeedArguments.ADMIN,
    [SeedArguments.ProjectToken, SeedArguments.FundingToken],
    [SeedArguments.softCap, SeedArguments.hardCap],
    SeedArguments.price,
    [SeedArguments.startTime, SeedArguments.endTime],
    [
      SeedArguments.hardCap,
      SeedArguments.vestingDuration,
      SeedArguments.vestingCliff,
    ],
    SeedArguments.isPermissioned,
    [], // whitelsit
    [SeedArguments.fee, 0, 0],
    SeedArguments.metadata
  );

  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seedManagement.js ~ line 36 ~ tx', tx)
}

createSeed();

// const signer = (await hre.ethers.getSigners())[0]
// const SeedFactoryContract = new ethers.Contract(
//   seedFactoryAddress,
//   seedFactoryInstance.interface,
//   signer
// );
