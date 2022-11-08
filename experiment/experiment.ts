import { localBlockExplorer } from "./local-block-explore";
var { SeedArguments } = require("../lib/params/seed-test-args.json");

// import * as hre from "hardhat"
const hre = require("hardhat");
import type { HardhatRuntimeEnvironment } from "hardhat/types/runtime"
const { getNamedAccounts, deployments, ethers } = hre;
const { BigNumber } = ethers;
// import * as hardhat from "hardhat";

// const root = ethers.get;
const SEED_FACTORY_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
// const SEED_FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const SEED_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";
const D2D_ADDRESS = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
const TestToken_ADDRESS = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707";

async function getContraact(name: string, address: string) {
  const instance = await ethers.getContractAt(name, address);
  return instance;
}

type Address = string;
type TokenName = "D2D" | "TestToken";
const tokenMap: Record<TokenName, Address> = {
  D2D: D2D_ADDRESS,
  TestToken: TestToken_ADDRESS,
};

async function getBalance(tokenName: TokenName, accountAddress: string) {
  const tokenAddress = tokenMap[tokenName];
  const tokenContract = await ethers.getContractAt(tokenName, tokenAddress);
  const balance = await tokenContract.balanceOf(accountAddress);
  return balance;
}

async function main() {
  const { root } = await getNamedAccounts();
  // const balance = await getBalance("D2D", root);
  const balance = await getBalance("TestToken", root);
  balance.toString();
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: experiment.ts ~ line 38 ~ balance.toString()', balance.toString())
}

main();

async function createSeed() {
  const readonlyEndPoint = "HTTP://127.0.0.1:8545";
  const provider = ethers.getDefaultProvider(readonlyEndPoint);
  const signer = (await hre.ethers.getSigners())[0];

  const seedFactoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  var seedFactoryInstance = await ethers.getContractAt(
    "SeedFactory",
    seedFactoryAddress
  );
  const SeedFactoryContract = new ethers.Contract(
    seedFactoryAddress,
    seedFactoryInstance.interface,
    signer
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

// async function run() {
//   const readonlyEndPoint = "HTTP://127.0.0.1:8545";
//   const provider = ethers.getDefaultProvider(readonlyEndPoint);

//   // const explorer = localBlockExplorer(provider)
//   // await explorer(0, 8)

//   // const block = await provider.getBlock("0x815b5bd94a41848598d7786d0da93a579d85778e9ef8f3d")
//   // const block = await provider.getBlock(2)

//   var D2DInstance = await ethers.getContractAt(
//     "D2D",
//     "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9"
//   );
//   D2DInstance.populateTransaction.balanceOf(
//     "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
//   ); /*?*/
//   const bal = await D2DInstance.balanceOf(
//     "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
//   ); /*?*/
//   bal.toString();
//   /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: experiment.ts ~ line 26 ~ bal.toString()', bal.toString())

//   // var TestTokenInstance = await ethers.getContractAt("TestToken", TestToken_ADDRESS);
//   // TestTokenInstance.address/*?*/
//   // TestTokenInstance.functions/*?*/

//   // var seedFactoryInstance = await ethers.getContractAt("SeedFactory", SEED_FACTORY_ADDRESS);
//   //  seedFactoryInstance/*?*/
//   // const addr = seedFactoryInstance.signer.getAddress();
//   //  addr/*?*/

//   /** SEED */

//   // await ethers.provider.getCode(SEED_ADDRESS)/*?*/

//   // var seedInstance = await ethers.getContractAt("Seed", SEED_ADDRESS);
//   // const instance = await seedInstance.deployed()
//   //  instance/*?*/
//   // seedInstance.functions/*?*/
//   // await seedInstance.seedToken()/*?*/
//   // await seedInstance.functions['seedToken()']()/*?*/
//   // await seedInstance.functions.seedToken()/*?*/

//   // seedFactoryInstance.address/*?*/

//   // const filter = seedFactoryInstance.filters.SeedCreated();
//   // filter/*?*/

//   const tx = await provider.getTransaction(
//     "0x5fcba008ae4423e2bee26173501b2247cbc7d28b6995bbbb263d51e3f30a58aa"
//   );
//   tx; /*?*/
//   // const tx = await provider.getTransaction("0xad963d6402ae4b92583d58bc465aa1d7830f2e60f6289e05363a0c6fb1a8b3c7")
// }

// run();
