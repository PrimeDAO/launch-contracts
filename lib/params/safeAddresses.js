const { network } = require("hardhat");
/**@typedef {import("../types/types").Address} Address */

/**
 *
 * @param {Address} root
 * @returns {Address}
 */
function getSafeAddress(root) {
  const networkName = network.name;
  switch (networkName) {
    case "mainnet":
      return "0x52F50f557704938Df066EC4Db7426D66538E7796";
    case "goerli":
      return "0xDb19E145b8Acb878B6410704b05BA4f91231E1F0";
    case "celo":
      return "0x0276a552F424949C934bC74bB623886AAc9Ed807";
    case "alfajores":
      return "0xF1734d53F5560C319395D633D131a5aB39aB06D7";
    default:
      return root;
  }
}

module.exports = {
  getSafeAddress,
};
