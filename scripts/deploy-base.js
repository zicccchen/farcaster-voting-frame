const hre = require("hardhat");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n🚀 部署投票合约到网络: ${network.name} (Chain ID: ${network.chainId})`);

  // 获取合约工厂并部署
  const Voting = await hre.ethers.getContractFactory("Voting");
  console.log("📦 编译合约并部署...");

  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`\n✅ Voting 合约已部署!`);
  console.log(`📍 合约地址: ${address}`);
  console.log(`🔗 浏览器: https://${network.chainId === 8453 ? 'basescan.org' : 'sepolia.basescan.org'}/address/${address}`);

  // 等待几个区块确认
  console.log("\n⏳ 等待区块确认...");
  await voting.deploymentTransaction().wait(2);

  // 创建示例提案
  console.log("\n📝 创建示例提案...");
  try {
    const tx = await voting.createProposal(
      "Base 生态系统是否应该集成更多 Frame 应用?",
      "这是一个测试提案，演示 Farcaster Frame 在 Base 网络上的链上投票功能。",
      1440 // 24小时 = 1440分钟
    );
    await tx.wait();
    console.log("✅ 示例提案已创建 (ID: 1)");
  } catch (error) {
    console.log("⚠️ 创建提案失败:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 部署总结");
  console.log("=".repeat(60));
  console.log(`网络: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`合约地址: ${address}`);
  console.log(`\n请将以下内容添加到 .env 文件:`);
  console.log(`VOTING_CONTRACT_ADDRESS=${address}`);

  if (network.chainId === 8453) {
    console.log(`\n🎉 已部署到 Base 主网!`);
    console.log(`Gas 费用: ~${hre.ethers.formatEther(voting.deploymentTransaction().gasPrice * 1000000)} ETH`);
  } else if (network.chainId === 84532) {
    console.log(`\n🧪 已部署到 Base Sepolia 测试网`);
    console.log(`💧 获取测试 ETH: https://faucet.quicknode.com/base`);
  }

  console.log("=".repeat(60) + "\n");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
