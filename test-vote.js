const { ethers } = require("ethers");
require("dotenv").config();

// 合约 ABI
const VOTING_ABI = [
    "function getProposal(uint256 proposalId) external view returns (uint256 id, string memory title, string memory description, uint256 yesVotes, uint256 noVotes, uint256 endTime, bool active, address creator)",
    "function vote(uint256 proposalId, bool support) external",
    "function hasVoted(uint256 proposalId, address voter) external view returns (bool)"
];

async function main() {
    console.log("🧪 开始测试投票合约...\n");

    // 连接到本地节点
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // 创建钱包（使用不同的测试账户）
    const wallet1 = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const wallet2 = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const wallet3 = new ethers.Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", provider);

    // 连接合约
    const contract = new ethers.Contract(process.env.VOTING_CONTRACT_ADDRESS, VOTING_ABI, provider);

    // 1. 获取初始提案状态
    console.log("📊 初始提案状态:");
    const [id, title, description, yesVotes, noVotes, endTime, active, creator] = await contract.getProposal(1);
    console.log(`   标题: ${title}`);
    console.log(`   赞成: ${yesVotes} | 反对: ${noVotes}`);
    console.log(`   状态: ${active ? "进行中" : "已结束"}\n`);

    // 2. wallet1 投赞成票
    console.log("✅ wallet1 投赞成票...");
    const tx1 = await contract.connect(wallet1).vote(1, true);
    await tx1.wait();
    console.log(`   交易哈希: ${tx1.hash}`);

    // 3. wallet2 投赞成票
    console.log("✅ wallet2 投赞成票...");
    const tx2 = await contract.connect(wallet2).vote(1, true);
    await tx2.wait();
    console.log(`   交易哈希: ${tx2.hash}`);

    // 4. wallet3 投反对票
    console.log("❌ wallet3 投反对票...");
    const tx3 = await contract.connect(wallet3).vote(1, false);
    await tx3.wait();
    console.log(`   交易哈希: ${tx3.hash}\n`);

    // 5. 查看更新后的状态
    console.log("📊 投票后状态:");
    const [id2, title2, description2, yesVotes2, noVotes2, endTime2, active2, creator2] = await contract.getProposal(1);
    console.log(`   赞成: ${yesVotes2} 票`);
    console.log(`   反对: ${noVotes2} 票`);
    console.log(`   总票数: ${Number(yesVotes2) + Number(noVotes2)} 票`);

    const yesPercent = ((Number(yesVotes2) / (Number(yesVotes2) + Number(noVotes2))) * 100).toFixed(1);
    const noPercent = ((Number(noVotes2) / (Number(yesVotes2) + Number(noVotes2))) * 100).toFixed(1);
    console.log(`   赞成率: ${yesPercent}% | 反对率: ${noPercent}%\n`);

    // 6. 检查投票记录
    console.log("🔍 验证投票记录:");
    const hasVoted1 = await contract.hasVoted(1, wallet1.address);
    const hasVoted2 = await contract.hasVoted(1, wallet2.address);
    const hasVoted3 = await contract.hasVoted(1, wallet3.address);

    console.log(`   wallet1 (${wallet1.address}): ${hasVoted1 ? "已投票 ✓" : "未投票"}`);
    console.log(`   wallet2 (${wallet2.address}): ${hasVoted2 ? "已投票 ✓" : "未投票"}`);
    console.log(`   wallet3 (${wallet3.address}): ${hasVoted3 ? "已投票 ✓" : "未投票"}\n`);

    // 7. 测试重复投票（应该失败）
    console.log("🚫 测试重复投票保护...");
    try {
        await contract.connect(wallet1).vote(1, true);
        console.log("   ❌ 错误: 允许了重复投票!");
    } catch (error) {
        console.log("   ✅ 正确: 成功阻止重复投票");
        console.log(`   错误信息: ${error.reason}\n`);
    }

    console.log("✅ 测试完成!");
    console.log("\n📡 现在 API 应该返回更新后的数据:");
    console.log("   curl http://localhost:3000/api/proposal?id=1\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
