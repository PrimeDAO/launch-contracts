// @ts-check
const hre = require("hardhat");
const LocalhostJson = require("../../exports/localhost.json");

const { ethers } = hre;

const SEED_FACTORY_NAME = "SeedFactoryNoAccessControl"
const seedFactoryAddress = LocalhostJson.contracts[SEED_FACTORY_NAME].address;
const readonlyEndPoint = "HTTP://127.0.0.1:8545"; // Localhost only!

function getProvider() {
  const provider = ethers.getDefaultProvider(readonlyEndPoint);
  return provider;
}

function getSigner() {
  const provider = getProvider();
  // @ts-ignore
  const jsonSigner = provider.getSigner();
  return jsonSigner;
}

class Shared {
  seedFactoryContract;
  seedContract;
  signer;

  constructor() {
    this.signer = getSigner();
  }

  async createSeedFactoryContract() {
    if (this.seedFactoryContract) return this.seedFactoryContract;

    var seedFactoryInstance = await ethers.getContractAt(
      SEED_FACTORY_NAME,
      seedFactoryAddress
    );

    this.seedFactoryContract = new ethers.Contract(
      seedFactoryAddress,
      seedFactoryInstance.interface,
      this.signer
    );

    return this.seedFactoryContract;
  }

  async getSeedFactoryContract() {
    if (!this.seedFactoryContract) {
      await this.createSeedFactoryContract();
    }

    return this.seedFactoryContract;
  }

  async createSeedContract(seedAddress) {
    var seedInstance = await ethers.getContractAt("Seed", seedAddress);

    this.seedContract = new ethers.Contract(
      seedAddress,
      seedInstance.interface,
      this.signer
    );

    return this.seedContract;
  }

  async getSeedContract(seedAddress) {
    const seedContract = await this.createSeedContract(seedAddress);
    return seedContract;
  }
}

const shared = new Shared();

module.exports = {
  Shared: shared,
};
