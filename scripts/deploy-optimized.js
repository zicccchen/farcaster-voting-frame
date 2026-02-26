const hre = require("hardhat");

async function main() {
  console.log(`\n🚀 部署优化版 Voting 合约到 Base 主网\n`);

  // 获取合约工厂
  const Voting = await hre.ethers.getContractFactory("VotingOptimized");
  console.log("📦 编译合约并部署...");

  // 部署合约
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\n✅ VotingOptimized 合约已部署!`);
  console.log(`📍 合约地址: ${address}`);
  console.log(`👤 部署者: ${deployer.address}`);
  console.log(`🔗 BaseScan: https://basescan.org/address/${address}`);

  // 等待几个区块确认
  console.log("\n⏳ 等待区块确认...");
  await voting.deploymentTransaction().wait(3);

  // 创建示例提案
  console.log("\n📝 创建示例提案...");
  try {
    const tx = await voting.createProposal(
      "Base 生态系统是否应该集成更多 Frame 应用?",
      "这是第一个提案，演示 Farcaster Frame 在 Base 网络上的链上投票功能。Base 是由 Coinbase 推出的以太坊 Layer 2 解决方案。",
      1440 // 24小时 = 1440分钟
    );
    await tx.wait();
    console.log("✅ 示例提案已创建 (ID: 1)");
  } catch (error) {
    console.log("⚠️ 创建提案失败:", error.message);
  }

  // 获取最终余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`\n💰 部署后余额: ${hre.ethers.formatEther(balance)} ETH`);

  console.log("\n" + "=".repeat(60));
  console.log("📋 部署总结");
  console.log("=".repeat(60));
  console.log(`网络: Base 主网 (Chain ID: 8453)`);
  console.log(`合约地址: ${address}`);
  console.log(`浏览器: https://basescan.org/address/${address}`);
  console.log(`\n请将以下内容添加到 .env 文件:`);
  console.log(`VOTING_CONTRACT_ADDRESS=${address}`);
  console.log(`\n更新 FRAME_URL 为你的生产 URL`);
  console.log("=".repeat(60) + "\n");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
