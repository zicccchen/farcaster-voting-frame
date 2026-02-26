const { ethers } = require("ethers");
require("dotenv").config();

// 合约 ABI (优化版本)
const VOTING_ABI = [
    "function getProposal(uint256 proposalId) external view returns (uint256 id, string memory title, string memory description, uint256 yesVotes, uint256 noVotes, uint256 endTime, bool active, address creator)",
    "function vote(uint256 proposalId, bool support) external",
    "function hasVotedFor(uint256 proposalId, address voter) external view returns (bool)",
    "function getRemainingTime(uint256 proposalId) external view returns (uint256)"
];

async function main() {
    console.log("🔍 验证 Base 主网合约\n");
    console.log("=" .repeat(60));

    // 连接到 Base 主网
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // 连接合约
    const contract = new ethers.Contract(process.env.VOTING_CONTRACT_ADDRESS, VOTING_ABI, provider);

    console.log(`📍 合约地址: ${process.env.VOTING_CONTRACT_ADDRESS}`);
    console.log(`👤 钱包地址: ${wallet.address}`);
    console.log(`🔗 BaseScan: https://basescan.org/address/${process.env.VOTING_CONTRACT_ADDRESS}\n`);

    // 1. 查询提案信息
    console.log("📊 提案 #1 信息:");
    const [id, title, description, yesVotes, noVotes, endTime, active, creator] = await contract.getProposal(1);

    console.log(`   标题: ${title}`);
    console.log(`   描述: ${description.substring(0, 80)}...`);
    console.log(`   创建者: ${creator}`);
    console.log(`   赞成: ${yesVotes} 票`);
    console.log(`   反对: ${noVotes} 票`);
    console.log(`   状态: ${active ? "进行中" : "已结束"}`);

    const remainingTime = await contract.getRemainingTime(1);
    const remainingHours = Math.floor(Number(remainingTime) / 3600);
    console.log(`   剩余时间: ${remainingHours} 小时\n`);

    // 2. 检查是否已投票
    const hasVoted = await contract.hasVotedFor(1, wallet.address);
    console.log(`✅ 投票状态: ${hasVoted ? "已投票" : "未投票"}`);

    // 3. 估算投票 Gas 费
    const contractWithWallet = contract.connect(wallet);
    try {
        const voteTx = await contractWithWallet.vote.estimateGas(1, true);
        const feeData = await provider.getFeeData();
        const gasCost = voteTx * feeData.gasPrice;
        const gasCostEth = ethers.formatEther(gasCost);

        console.log(`\n💰 投票交易估算:`);
        console.log(`   Gas: ${voteTx.toString()}`);
        console.log(`   费用: ~${gasCostEth} ETH (约 $${(parseFloat(gasCostEth) * 3000).toFixed(4)})`);
    } catch (error) {
        console.log(`\n⚠️ 无法估算投票 Gas: ${error.message}`);
    }

    console.log("\n" + "=" .repeat(60));
    console.log("✅ Base 主网合约验证成功！");
    console.log("=" .repeat(60));
    console.log("\n🚀 下一步:");
    console.log("   1. 部署 Frame 服务器到 Vercel/Railway");
    console.log("   2. 更新 FRAME_URL 为生产域名");
    console.log("   3. 在 Farcaster 中分享你的 Frame！");
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
