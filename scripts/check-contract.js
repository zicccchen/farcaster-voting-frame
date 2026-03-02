const hre = require("hardhat");
const ABI = [
  "function vote(uint256 _proposalId, uint256 _optionIndex) public",
  "function vote(uint256 proposalId, bool support) public",
  "function proposalCount() public view returns (uint256)"
];

async function main() {
  const address = "0x78675fF0Bf530977e535f77B034CEe7D2a4fd4Ad";
  const provider = new hre.ethers.JsonRpcProvider("https://mainnet.base.org");
  const contract = new hre.ethers.Contract(address, ABI, provider);

  console.log(`\n🔍 检查合约: ${address}`);
  console.log(`🔗 BaseScan: https://basescan.org/address/${address}\n`);

  try {
    // 检查多选项投票方法
    const iface1 = new hre.ethers.Interface([
      "function vote(uint256 _proposalId, uint256 _optionIndex)"
    ]);
    const selector1 = iface1.getFunction("vote").selector;
    console.log("✅ 合约支持多选项投票 (vote(uint256,uint256))");

    // 检查 proposalCount
    const count = await contract.proposalCount();
    console.log(`📊 提案数量: ${count}`);

  } catch (error) {
    console.log("❌ 合约检查失败:", error.message);
    console.log("\n可能原因:");
    console.log("1. 合约未验证，无法获取 ABI");
    console.log("2. 合约地址不正确");
    console.log("3. 合约方法签名不匹配");
  }
}

main().catch(console.error);
