const hre = require("hardhat");

async function main() {
  console.log("部署投票合约到网络:", hre.network.name);

  // 获取合约工厂并部署
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("\n✓ Voting 合约已部署到:", address);

  // 创建一个示例提案
  console.log("\n创建示例提案...");
  const tx = await voting.createProposal(
    "Farcaster 生态系统是否需要更多 Frame 工具?",
    "这是一个测试提案，用于演示 Farcaster Frame 的链上投票功能。",
    60 // 60分钟投票时间
  );
  await tx.wait();

  console.log("✓ 示例提案已创建 (ID: 1)");

  console.log("\n请将以下地址添加到 .env 文件:");
  console.log(`VOTING_CONTRACT_ADDRESS=${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
