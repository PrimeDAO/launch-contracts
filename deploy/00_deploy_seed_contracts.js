const deployFunction = async ({ getNamedAccounts, deployments }) => {
    const { deploy, execute } = deployments;
    const { root } = await getNamedAccounts();
    // const safeInstance =
    //     network.name == "kovan" ? root : await ethers.getContract("Safe");
    // const safeInstance = root;

    // https://github.com/PrimeDAO/contracts-v2/blob/main/deployments/mainnet/Safe.json
    const safeInstance = '0x52F50f557704938Df066EC4Db7426D66538E7796';

    await deploy("SeedFactory", {
        from: root,
        args: [],
        log: true,
    });

    const { address: seedAddress } = await deploy("Seed", {
        from: root,
        args: [],
        log: true,
    });

    await execute('SeedFactory', { from: root, log: true, gasPrice: 10000000000 }, 'setMasterCopy', seedAddress)
    await execute('SeedFactory', { from: root, log: true, gasPrice: 10000000000 }, 'transferOwnership', safeInstance)
};

module.exports = deployFunction;
module.exports.tags = ["Seed"];