// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");

// const {
//   utils: { formatBytes32String },
// } = ethers;

// const { loadFixture } = waffle;
// const { launchFixture } = require("./helpers/fixtures.js");

// const EMPTY32BYTES = formatBytes32String("");

// describe("> Contract: Seed", () => {
//   let initializedSeedInstance, uninitializedSeedInstance, seedArguments;
//   beforeEach(async () => {
//     ({ initializedSeedInstance, uninitializedSeedInstance, seedArguments } =
//       await loadFixture(launchFixture));
//   });
//   describe("$ Function: initialize()", () => {
//     describe("# given the Seed has already been initialized", () => {
//       describe("» when calling function initialze()", () => {
//         it("should revert", async () => {
//           await expect(
//             initializedSeedInstance.initialize(...seedArguments)
//           ).to.be.revertedWith("Seed: contract already initialized");
//         });
//       });
//     });
//     describe("# given the Seed has not been initialized", () => {
//       describe("» when calling function initialize()", () => {
//         beforeEach(async () => {
//           await uninitializedSeedInstance.initialize(...seedArguments);
//         });
//         it("should set beneficiary", async () => {
//           expect(await uninitializedSeedInstance.beneficiary()).to.equal(
//             seedArguments[0]
//           );
//         });
//         it("should set admin", async () => {
//           expect(await uninitializedSeedInstance.admin()).to.equal(
//             seedArguments[1]
//           );
//         });
//         it("should set tokens", async () => {
//           expect(await uninitializedSeedInstance.seedToken()).to.equal(
//             seedArguments[2][0]
//           );
//           expect(await uninitializedSeedInstance.fundingToken()).to.equal(
//             seedArguments[2][1]
//           );
//         });
//         it("should set caps", async () => {
//           expect(await uninitializedSeedInstance.softCap()).to.equal(
//             seedArguments[3][0]
//           );
//           expect(await uninitializedSeedInstance.hardCap()).to.equal(
//             seedArguments[3][1]
//           );
//         });
//         it("should set price", async () => {
//           expect(await uninitializedSeedInstance.price()).to.equal(
//             seedArguments[4]
//           );
//         });
//         it("should set start and end time", async () => {
//           expect(await uninitializedSeedInstance.startTime()).to.equal(
//             seedArguments[5][0]
//           );
//           expect(await uninitializedSeedInstance.endTime()).to.equal(
//             seedArguments[5][1]
//           );
//         });
//         it("should set permission", async () => {
//           expect(await uninitializedSeedInstance.permissionedSeed()).to.equal(
//             seedArguments[7]
//           );
//         });
//         it("should set defaultContributorClass", async () => {
//           const defaultClass = await uninitializedSeedInstance.classes(0);
//           expect(defaultClass.className).to.equal(EMPTY32BYTES);
//           expect(defaultClass.classCap).to.equal(seedArguments[3][1]);
//           expect(defaultClass.individualCap).to.equal(seedArguments[6][0]);
//           expect(defaultClass.vestingCliff).to.equal(seedArguments[6][1]);
//           expect(defaultClass.vestingDuration).to.equal(seedArguments[6][2]);
//         });
//         it("should set whitelist", async () => {
//           // ToDo in next PR
//         });
//         it("should set tipping", async () => {
//           // ToDo in next PR
//         });
//         it("should calculate seedAmountRequired", async () => {
//           // ToDo in next PR
//         });
//       });
//     });
//   });
//   describe("$ Function: addClass()", () => {
//     describe("# given the Seed is closed", () => {
//       describe("» when adding a new class", () => {
//         it("should revert", async () => {});
//       });
//     });
//     describe("# given the caller is not the admin", () => {
//       describe("» when adding a new class", () => {
//         it("should revert", async () => {});
//       });
//     });
//     describe("# given the max number of classes has been reached", () => {
//       describe("» when adding a new class", () => {
//         it("should revert", async () => {});
//       });
//     });
//     describe("# given the class cap parameters are invalid ", () => {
//       describe("» when adding a new class", () => {
//         it("should fail if individual cap > class cap", async () => {});
//         it("should fail if class cap > hard cap", async () => {});
//         it("should fail if class cap is not bigger than 0", async () => {});
//       });
//     });
//     describe("# given the Seed has already started ", () => {
//       describe("» when adding a new class", () => {
//         it("should revert", async () => {});
//       });
//     });
//   });
//   describe("$ Function: addClassBatch()", () => {
//     // This function redirects calls to addClass(). Because of this, tests that include the
//     // function addClass() are left out
//     describe("# given the caller is not the admin", () => {
//       describe("» when adding a new batch of classes", () => {
//         it("should revert", async () => {});
//       });
//     });
//     describe("# given the admin want to add more than 100 classes", () => {
//       describe("» when adding a new batch of classes", () => {
//         it("should revert", async () => {});
//       });
//     });
//     describe("# given the max number of classes will be reached by the call ", () => {
//       describe("» when adding a new batch of classes", () => {
//         it("shouldrevert", async () => {});
//       });
//     });
//     describe("# given the input arrays mismatch in length", () => {
//       describe("» when adding a new batch of classes", () => {
//         it("should revert on mismatch classCaps array", async () => {});
//         it("should revert on mismatch classNames array", async () => {});
//         it("should revert on mismatch individualCaps array", async () => {});
//         it("should revert on mismatch vestingCliffs array", async () => {});
//         it("should revert on mismatch vestingDurations array", async () => {});
//       });
//     });
//   });
//   describe("$ Function: setClass()", () => {});
//   describe("$ Function: setClassBatch()", () => {});
//   describe("$ Function: changeClass()", () => {});
//   describe("$ Function: buy()", () => {});
//   describe("$ Function: claim()", () => {});
//   describe("$ Function: retrieveFundingTokens()", () => {});
//   describe("$ Function: pause()", () => {});
//   describe("$ Function: unpause()", () => {});
//   describe("$ Function: close()", () => {});
//   describe("$ Function: retrieveSeedTokens()", () => {});
//   describe("$ Function: whitelist()", () => {});
//   describe("$ Function: whitelistBatch()", () => {});
//   describe("$ Function: unwhitelist()", () => {});
//   describe("$ Function: withdraw()", () => {});
//   describe("$ Function: updateMetadata()", () => {});
//   describe("$ Function: calculateClaim()", () => {});
//   describe("$ Function: seedAmountForFunder()", () => {});
// });
