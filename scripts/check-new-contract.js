const hre = require("hardhat");

async function main() {
  const address = "0x7d6Be832915a8064F898d34181A28E0C98a76354";
  const ABI = [
    "function proposalCount() public view returns (uint256)",
    "function getProposal(uint256) public view returns (uint256 id, string memory title, string memory description, string[] memory options, uint256[] memory voteCounts, uint256 endTime, address creator, bool active, uint256 totalVotes)"
  ];
  
  const provider = new hre.ethers.JsonRpcProvider("https://mainnet.base.org");
  const contract = new hre.ethers.Contract(address, ABI, provider);

  console.log(`\n🔍 检查新合约: ${address}`);
  console.log(`🔗 BaseScan: https://basescan.org/address/${address}\n`);

  try {
    const count = await contract.proposalCount();
    console.log(`📊 提案数量: ${count}`);

    if (count > 0) {
      const p = await contract.getProposal(1);
      console.log(`\n📝 提案 #1:`);
      console.log(`   标题: ${p.title}`);
      console.log(`   选项: ${p.options.join(", ")}`);
      console.log(`   票数: ${p.voteCounts.map(v => v.toString()).join(", ")}`);
      console.log(`   总票数: ${p.totalVotes}`);
      console.log(`   活跃: ${p.active}`);
    }
    console.log("\n✅ 新合约工作正常!");
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

main().catch(console.error);
