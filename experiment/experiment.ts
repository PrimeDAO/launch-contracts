import { localBlockExplorer } from "./local-block-explore";
import { ethers } from "hardhat";
const { BigNumber } = ethers
// import * as hardhat from "hardhat";

const SEED_FACTORY_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
// const SEED_FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const D2D_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"

async function run() {
  const readonlyEndPoint = "HTTP://127.0.0.1:8545"
  const provider = ethers.getDefaultProvider(readonlyEndPoint);

  // const explorer = localBlockExplorer(provider)
  // await explorer(0, 8)

  // const block = await provider.getBlock("0x815b5bd94a41848598d7786d0da93a579d85778e9ef8f3d")
  // const block = await provider.getBlock(2)

  var D2DInstance = await ethers.getContractAt("D2D", D2D_ADDRESS);
   D2DInstance.address/*?*/
   D2DInstance.functions/*?*/
  //  D2DInstance.populateTransaction.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")/*?*/
  //  D2DInstance.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")/*?*/

  // var seedFactoryInstance = await ethers.getContractAt("SeedFactory", SEED_FACTORY_ADDRESS);
  //  seedFactoryInstance/*?*/
  // const addr = seedFactoryInstance.signer.getAddress();
  //  addr/*?*/

  // seedFactoryInstance.address/*?*/


  // const filter = seedFactoryInstance.filters.SeedCreated();
  // filter/*?*/




  const tx = await provider.getTransaction("0x5fcba008ae4423e2bee26173501b2247cbc7d28b6995bbbb263d51e3f30a58aa")
  tx/*?*/
  // const tx = await provider.getTransaction("0xad963d6402ae4b92583d58bc465aa1d7830f2e60f6289e05363a0c6fb1a8b3c7")
}

run()
