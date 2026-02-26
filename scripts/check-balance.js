const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    console.log("🔍 检查 Base 主网钱包余额...\n");

    // 连接到 Base 主网
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

    // 从私钥创建钱包
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 钱包地址: ${wallet.address}`);
    console.log(`🔗 BaseScan: https://basescan.org/address/${wallet.address}\n`);

    // 获取余额
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);

    console.log(`💰 余额: ${balanceEth} ETH`);

    // 估算部署费用
    const estimatedDeploymentGas = ethers.parseUnits("0.002", "ether"); // 约 $2-3
    const estimatedProposalGas = ethers.parseUnits("0.0001", "ether");

    console.log(`\n📊 费用估算:`);
    console.log(`   合约部署: ~${ethers.formatEther(estimatedDeploymentGas)} ETH`);
    console.log(`   创建提案: ~${ethers.formatEther(estimatedProposalGas)} ETH`);

    if (balance < estimatedDeploymentGas) {
        console.log(`\n❌ 余额不足！`);
        console.log(`   需要: 至少 ${ethers.formatEther(estimatedDeploymentGas)} ETH`);
        console.log(`   当前: ${balanceEth} ETH`);
        console.log(`   缺少: ${ethers.formatEther(estimatedDeploymentGas - balance)} ETH`);
        console.log(`\n💡 获取 Base ETH:`);
        console.log(`   1. 从交易所购买 ETH`);
        console.log(`   2. 使用官方桥接: https://bridge.base.org`);
        console.log(`   3. 跨链到 Base: 从其他网络桥接`);
        process.exit(1);
    } else {
        console.log(`\n✅ 余额充足，可以部署！`);
        console.log(`   部署后预计剩余: ${ethers.formatEther(balance - estimatedDeploymentGas)} ETH\n`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
