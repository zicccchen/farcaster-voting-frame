const hre = require("hardhat");

async function main() {
  console.log("\n🚀 部署多选项投票合约到 Base 主网...");

  const network = await hre.ethers.provider.getNetwork();
  console.log(`网络: ${network.name} (Chain ID: ${network.chainId})`);

  // 获取合约工厂
  const VotingMulti = await hre.ethers.getContractFactory("VotingMulti");
  console.log("📦 编译合约并部署...");

  // 部署合约
  const votingMulti = await VotingMulti.deploy();
  await votingMulti.waitForDeployment();

  const address = await votingMulti.getAddress();
  console.log(`\n✅ VotingMulti 合约已部署!`);
  console.log(`📍 合约地址: ${address}`);
  console.log(`🔗 BaseScan: https://basescan.org/address/${address}`);

  // 等待几个区块确认
  console.log("\n⏳ 等待区块确认...");
  await votingMulti.deploymentTransaction().wait(3);

  // 创建示例提案
  console.log("\n📝 创建示例提案...");
  try {
    const tx = await votingMulti.createProposal(
      "Base 生态最喜欢的应用类型是？",
      "选出你认为在 Base 生态中最有潜力的应用类型",
      ["DeFi", "NFT", "GameFi", "Social"],
      720 // 30 天 = 720 小时
    );
    await tx.wait();
    console.log("✅ 示例提案已创建 (ID: 1)");
    console.log("   选项: DeFi, NFT, GameFi, Social");
  } catch (error) {
    console.log("⚠️ 创建提案失败:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 部署总结");
  console.log("=".repeat(60));
  console.log(`合约地址: ${address}`);
  console.log(`\n请更新 .env 文件:`);
  console.log(`VOTING_CONTRACT_ADDRESS=${address}`);
  console.log("\n🔐 验证合约:");
  console.log(`npx hardhat verify --network base ${address}`);
  console.log("=".repeat(60) + "\n");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
