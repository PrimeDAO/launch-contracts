//@ts-check

/**
 * @typedef {Object} ParamsType
 * @property {number} SEED_DEPLOY_INSTANCE - for deploying Seed instance
 * @property {number} SEED_INITIALIZE - for init Seed
 * @property {number} SEEDFACTORY_DEPLOY_INSTANCE - for deploying SeedFactory
 * @property {number} SEEDFACTORY_DEPLOY_SEED - for deploying Seed from SeedFactory
 * @property {number} SEED_CHANGE_CLASSES_AND_ALLOWLISTS - for changing a class
 */

/**
 * @typedef {Object} DeployParams
 * @property {SignerWithAddress=} from
 * @property {*=} args - deploy arguments for the contract
 */

/**
 * @typedef {[address: string, lolg: number, from: Object]} SeedInitParams
 */

/**
 * @typedef {Object} ClassesParameters
 * @property {ContributorClassParams} class1
 * @property {ContributorClassParams} class2
 * @property {ContributorClassParams} class3
 */

/**
 * @typedef {Object} ChangeClassAndAllowlistParams
 * @property {number=} class
 * @property {string=} className
 * @property {string=} classCap
 * @property {string=} individualCap
 * @property {number=} vestingCliff
 * @property {number=} vestingDuration
 * @property {Address[]=} allowlist
 */

/**
 * @typedef {Object} ChangeClassesAndAllowlistsParameters
 * @property {ChangeClassAndAllowlistParams} class1
 * @property {ChangeClassAndAllowlistParams} class2
 * @property {ChangeClassAndAllowlistParams} class3
 */
/**
 * @typedef {Object} ContributorClassFromContract
 * @property {string} className - of type bytes32
 * @property {BigNumber} classCap - Amount of tokens that can be donated for class
 * @property {BigNumber} individualCap // Amount of tokens that can be donated by specific contributor
 * @property {BigNumber} vestingCliff // Cliff of the class
 * @property {BigNumber} vestingDuration // Vesting Duration of the class
 * @property {BigNumber} classFundingCollected // Total amount of funding tokens contributed
 */

/**
 * @typedef {Object} FunderPortfolio
 * @property {number} class - Contributor class Id
 * @property {BigNumber} totalClaimed - Total amount of seed tokens claimed
 * @property {BigNumber} fundingAmount - Total amount of funding tokens contributed
 * @property {boolean} allowlist - Value to check if funder is allowlisted
 */

/**
 * @typedef {Object} Tip
 * @property {BigNumber} tipAmount
 * @property {BigNumber} vestingCliff
 * @property {BigNumber} vestingDuration
 * @property {BigNumber} tipAmount
 * @property {BigNumber} totalClaimed
 */

/**
 * @typedef {Object} ContributorClassParams
 * @property {string=} className
 * @property {string=} classCap
 * @property {string=} individualCap
 * @property {number=} vestingCliff
 * @property {number=} vestingDuration
 */

/**
 * @typedef {Object} AllowlistParams
 * @property {Array<Address>=} allowlist
 * @property {Array<number>=} classes
 */

/**
 * @typedef {Object} GetClassParamsFromTypeParams
 * @property {number=} fundingTokenDecimal
 * @property {number=} class
 * @property {string=} className
 * @property {string=} classCap
 * @property {string=} individualCap
 * @property {number=} vestingCliff
 * @property {number=} vestingDuration
 *
 */

/**
 * @typedef {Object} TestParams
 * @property {Address=} admin -
 * @property {Address=} beneficiary -
 * @property {SignerWithAddress=} from -
 * @property {Address=} newOwner -
 * @property {Address=} seedAddress -
 * @property {*=} tip - [tipPercentage, tipVestingCliff]
 * @property {Array<number, number>=} startAndEndTime - [startTime, endTime]
 * @property {*=} defaultClassParameters -
 * @property {Array<Address, Address>=} tokenAddresses - [seedTokenAddress, seedTokenAddress]
 * @property {*=} softAndHardCaps - [softCap, hardCap]
 * @property {*=} price -
 * @property {boolean=} permissionedSeed -
 * @property {Array<Address>=} allowlist - []
 * @property {Array<Contract, Contract>} tokenInstances -
 */

/**
 * @typedef {import('../../test/helpers/contracts/seed/Seed.js').Seed} Seed
 * @typedef {import("hardhat-deploy-ethers/signers.js").SignerWithAddress} SignerWithAddress
 * @typedef {import('../../test/helpers/contracts/seed/SeedFactory.js').SeedFactory} SeedFactory
 * @typedef {import("hardhat-deploy/dist/types.js").Address} Address
 * @typedef {import("ethers").BigNumber} BigNumber
 * @typedef {import("ethers").Contract} Contract
 */

module.exports = {};
