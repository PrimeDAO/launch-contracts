const { network } = require("hardhat");

function getSafeAddress() {
  const networkName = network.name;
  switch (networkName) {
    case "mainnet":
      return "0x52F50f557704938Df066EC4Db7426D66538E7796";

    case "rinkeby":
      return "0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C";

    case "goerli":
      return "0xDb19E145b8Acb878B6410704b05BA4f91231E1F0";

    case "celo":
      return "0x0276a552F424949C934bC74bB623886AAc9Ed807";

    default:
      return root;
  }
}

module.exports = {
  getSafeAddress,
};
