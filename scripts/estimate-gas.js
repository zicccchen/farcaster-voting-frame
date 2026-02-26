const hre = require("hardhat");

async function estimateGas(contractName, description) {
    console.log(`\n📊 ${description}`);
    console.log("=".repeat(50));

    const ContractFactory = await hre.ethers.getContractFactory(contractName);

    // 估算部署 Gas
    const deploymentTx = await ContractFactory.getDeployTransaction();
    const estimatedGas = await hre.ethers.provider.estimateGas(deploymentTx);

    // 获取当前 Gas 价格
    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // 计算部署成本
    const deploymentCost = estimatedGas * gasPrice;
    const deploymentCostEth = hre.ethers.formatEther(deploymentCost);

    console.log(`合约: ${contractName}`);
    console.log(`估算 Gas: ${estimatedGas.toString()}`);
    console.log(`Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log(`部署成本: ${deploymentCostEth} ETH`);

    return {
        contract: contractName,
        gas: estimatedGas.toString(),
        cost: deploymentCostEth
    };
}

async function main() {
    console.log("\n🔍 Gas 费用估算对比\n");

    const original = await estimateGas("Voting", "原始版本");
    const optimized = await estimateGas("VotingOptimized", "优化版本");

    // 计算节省
    const gasSaved = BigInt(original.gas) - BigInt(optimized.gas);
    const percentSaved = (Number(gasSaved) / Number(original.gas) * 100).toFixed(2);
    const costSaved = (parseFloat(original.cost) - parseFloat(optimized.cost)).toFixed(6);

    console.log("\n" + "=".repeat(50));
    console.log("💡 优化效果");
    console.log("=".repeat(50));
    console.log(`Gas 节省: ${gasSaved} (${percentSaved}%)`);
    console.log(`成本节省: ${costSaved} ETH`);
    console.log(`\n✅ 优化后部署成本: ${optimized.cost} ETH`);

    // 检查当前余额
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceEth = hre.ethers.formatEther(balance);

    console.log(`\n💰 当前余额: ${balanceEth} ETH`);

    if (balance > hre.ethers.parseEther(optimized.cost)) {
        console.log(`✅ 余额充足！可以部署优化版合约`);
        console.log(`   部署后预计剩余: ${(parseFloat(balanceEth) - parseFloat(optimized.cost)).toFixed(6)} ETH`);
    } else {
        console.log(`❌ 余额仍不足 ${ (parseFloat(optimized.cost) - parseFloat(balanceEth)).toFixed(6)} ETH`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
