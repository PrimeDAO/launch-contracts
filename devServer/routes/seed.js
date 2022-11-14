// @ts-check
var express = require("express");
var router = express.Router();
const { Shared } = require("../shared/shared");

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("seed starting");
});

/** POST /create */
router.post("/create", async function (req, res) {
  const createParams = req.body;

  const emittedEventData = await createSeed(createParams);
  const payload = { ...emittedEventData };

  res.send(JSON.stringify(payload));
});

/** POST /:id/addClass */
router.post("/:id/addClass", async function (req, res) {
  const { seedId, addClassParams } = req.body;
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seed.js ~ line 24 ~ seedId', seedId)
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seed.js ~ line 24 ~ addClassParams', addClassParams)

  if (addClassParams.classAllowlists[0] === null) {
    addClassParams.classAllowlists[0] = [];
  }
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seed.js ~ line 24 ~ addClassParams', addClassParams)

  const emittedEventData = await addClass(seedId, addClassParams);
  const payload = { ...emittedEventData };

  res.send(JSON.stringify(payload));
});

async function createSeed(createParams) {
  try {
    const SeedFactoryContract = await Shared.getSeedFactoryContract();

    var tx = await SeedFactoryContract.deploySeed(...createParams);
    console.log(`Seed created through tx ${tx.hash}`);

    var receipt = await tx.wait();
    const seedCreatedEvent = findSeedCreatedEvent(receipt.events);
    const { args: emittedEventData } = seedCreatedEvent;

    return emittedEventData;
  } catch (error) {
    console.log("error: ", error);
  }
}

async function addClass(seedId, addClassParams) {
  const SeedContract = await Shared.getSeedContract(seedId);
  const finalParams = Object.values(addClassParams)
  const tx = await SeedContract.addClassesAndAllowlists(...finalParams);

  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seed.js ~ line 59 ~ tx', tx)
  var receipt = await tx.wait();
  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: seed.js ~ line 55 ~ receipt', receipt)
  return receipt
}

const seedCreatedEventName = "SeedCreated";
function findSeedCreatedEvent(events) {
  const target = events.find((event) => event.event === seedCreatedEventName);
  return target;
}

module.exports = router;
