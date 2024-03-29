const { task } = require("hardhat/config");
const { api } = require("../lib/gnosis");

// Find safe address for right network in ../lib/params/safeAddresses.js or inside the deployments
// folder under the respective network
task("addDelegate", "adds delegate to Gnosis Safe")
  .addParam("safe", "address of safe", undefined)
  .addParam("delegate", "address of delegate", undefined)
  .setAction(
    async ({ safe: safeAddress, delegate: delegateAddress }, { ethers }) => {
      console.log(
        `adding delegate ${delegateAddress} to Gnosis Safe ${safeAddress}`
      );
      const gnosis = api(safeAddress, network.name);
      const { root } = await ethers.getNamedSigners();
      const label = "Signer";
      const totp = Math.floor(Math.floor(Date.now() / 1000) / 3600);
      const signature = await root.signMessage(
        delegateAddress + totp.toString()
      );
      const payload = {
        safe: safeAddress,
        delegate: delegateAddress,
        label,
        signature,
      };
      const result = await gnosis.addDelegate(payload);
      if (result.status == 201) {
        console.log("Successfully added");
        return;
      }
      console.log(result);
      return;
    }
  );

task(
  "getDelegates",
  "returns the addresses of the delegates, and prints it to the console"
)
  .addParam("safe", "address of the safe")
  .setAction(async ({ safe: safeAddress }) => {
    console.log(
      `The following addresses are delegates for the safe with address ${safeAddress}:`
    );
    const gnosis = api(safeAddress, network.name);
    const delegates = await gnosis.getDelegates();
    console.log(delegates);
  });
