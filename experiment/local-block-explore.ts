const miner = "0xC014BA5EC014ba5ec014Ba5EC014ba5Ec014bA5E";

/**
 * https://ethereum.stackexchange.com/questions/2919/block-explorer-running-on-private-network
 */
export function localBlockExplorer(provider) {
  var eth = provider;

  async function printTransaction(txHash) {
    var tx = await eth.getTransaction(txHash);
    if (tx != null) {
      console.log("  tx hash          : " + tx.hash + "\n"
        + "   nonce           : " + tx.nonce + "\n"
        + "   blockHash       : " + tx.blockHash + "\n"
        + "   blockNumber     : " + tx.blockNumber + "\n"
        + "   transactionIndex: " + tx.transactionIndex + "\n"
        + "   from            : " + tx.from + "\n"
        + "   to              : " + tx.to + "\n"
        + "   value           : " + tx.value + "\n"
        + "   gasPrice        : " + tx.gasPrice + "\n"
        + "   gas             : " + tx.gas + "\n"
        + "   input           : " + tx.input);
    }
  }

  function printBlock(block) {
    console.log("Block number     : " + block.number + "\n"
      + " hash            : " + block.hash + "\n"
      + " parentHash      : " + block.parentHash + "\n"
      + " nonce           : " + block.nonce + "\n"
      + " sha3Uncles      : " + block.sha3Uncles + "\n"
      + " logsBloom       : " + block.logsBloom + "\n"
      + " transactionsRoot: " + block.transactionsRoot + "\n"
      + " stateRoot       : " + block.stateRoot + "\n"
      + " miner           : " + block.miner + "\n"
      + " difficulty      : " + block.difficulty + "\n"
      + " totalDifficulty : " + block.totalDifficulty + "\n"
      + " extraData       : " + block.extraData + "\n"
      + " data            : " + block.data + "\n"
      + " size            : " + block.size + "\n"
      + " gasLimit        : " + block.gasLimit + "\n"
      + " gasUsed         : " + block.gasUsed + "\n"
      + " timestamp       : " + block.timestamp + "\n"
      + " transactions    : " + block.transactions + "\n"
      + " uncles          : " + block.uncles);
      if (block.transactions != null) {
        console.log("--- transactions ---");
        block.transactions.forEach( async function(e) {
          await printTransaction(e);
        })
      }
  }

  function printUncle(block, uncleNumber, uncle) {
    console.log("Block number     : " + block.number + " , uncle position: " + uncleNumber + "\n"
      + " Uncle number    : " + uncle.number + "\n"
      + " hash            : " + uncle.hash + "\n"
      + " parentHash      : " + uncle.parentHash + "\n"
      + " nonce           : " + uncle.nonce + "\n"
      + " sha3Uncles      : " + uncle.sha3Uncles + "\n"
      + " logsBloom       : " + uncle.logsBloom + "\n"
      + " transactionsRoot: " + uncle.transactionsRoot + "\n"
      + " stateRoot       : " + uncle.stateRoot + "\n"
      + " miner           : " + uncle.miner + "\n"
      + " difficulty      : " + uncle.difficulty + "\n"
      + " totalDifficulty : " + uncle.totalDifficulty + "\n"
      + " extraData       : " + uncle.extraData + "\n"
      + " size            : " + uncle.size + "\n"
      + " gasLimit        : " + uncle.gasLimit + "\n"
      + " gasUsed         : " + uncle.gasUsed + "\n"
      + " timestamp       : " + uncle.timestamp + "\n"
      + " transactions    : " + uncle.transactions + "\n");
  }

  async function getMinedBlocks(miner, startBlockNumber, endBlockNumber) {
    if (endBlockNumber == null) {
      endBlockNumber = eth.blockNumber;
      console.log("Using endBlockNumber: " + endBlockNumber);
    }
    if (startBlockNumber == null) {
      startBlockNumber = endBlockNumber - 10000;
      console.log("Using startBlockNumber: " + startBlockNumber);
    }
    console.log("Searching for miner \"" + miner + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber + "\"");

    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
      if (i % 1000 == 0) {
        console.log("Searching block " + i);
      }
      var block = await eth.getBlock(i);
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: local-block-explore.ts ~ line 88 ~ block', block)
      continue
      if (block != null) {
        if (block.miner == miner || miner == "*") {
          console.log("Found block " + block.number);
          printBlock(block);
        }
        if (block.uncles != null) {
          for (var j = 0; j < 2; j++) {
            var uncle = await eth.getUncle(i, j);
            if (uncle != null) {
              if (uncle.miner == miner || miner == "*") {
                console.log("Found uncle " + block.number + " uncle " + j);
                printUncle(block, j, uncle);
              }
            }
          }
        }
      }
    }
  }

  async function getMyMinedBlocks(startBlockNumber, endBlockNumber) {
    const account = (eth.accounts && eth.accounts[0]) ?? miner
    await getMinedBlocks(account, startBlockNumber, endBlockNumber);
  }

  return getMyMinedBlocks
}
