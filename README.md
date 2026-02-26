# Farcaster 链上投票 Frame

基于 Farcaster Frame 的去中心化投票系统，支持在 Farcaster 社交网络中直接进行链上投票。

## 功能特性

- ✅ 链上投票合约（Solidity）
- 🎨 Farcaster Frame 集成
- 📊 实时投票结果展示
- 🔐 去中心化、透明可验证
- 🚀 简单易部署

## 项目结构

```
farcaster-voting-frame/
├── contracts/
│   └── Voting.sol              # 投票智能合约
├── scripts/
│   └── deploy.js               # 合约部署脚本
├── public/
│   └── frame.html              # Frame 前端页面
├── server.js                   # Frame API 服务器
├── hardhat.config.js           # Hardhat 配置
├── package.json                # 项目依赖
├── .env.example                # 环境变量模板
└── README.md                   # 项目文档
```

## 快速开始

### 1. 安装依赖

```bash
cd farcaster-voting-frame
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PRIVATE_KEY=0x...你的私钥
RPC_URL=http://localhost:8545
VOTING_CONTRACT_ADDRESS=部署后填写
FRAME_URL=http://localhost:3000
```

### 3. 启动本地节点

在新终端窗口中运行：

```bash
npx hardhat node
```

这将启动一个本地以太坊节点，并预置测试账户。

### 4. 编译并部署合约

```bash
# 编译合约
npx hardhat compile

# 部署合约
npm run deploy:contract
```

部署成功后，复制合约地址到 `.env` 文件的 `VOTING_CONTRACT_ADDRESS`。

### 5. 启动 Frame 服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 使用指南

### 在 Farcaster 中创建 Frame Cast

1. 在 Warpcast 或其他 Farcaster 客户端中创建新 Cast
2. 粘贴你的 Frame URL: `http://localhost:3000`（或部署后的公网 URL）
3. 发布后即可看到可交互的 Frame

### 投票流程

1. **查看提案**: 点击 Frame 显示提案详情
2. **进行投票**:
   - 👍 赞成 - 投赞成票
   - 👎 反对 - 投反对票
   - 📊 查看结果 - 查看当前投票统计
3. **完成投票**: 确认交易后投票记录上链

## 合约 API

### Voting.sol 主要方法

```solidity
// 创建提案
function createProposal(
    string memory title,
    string memory description,
    uint256 durationMinutes
) public returns (uint256)

// 投票
function vote(uint256 proposalId, bool support) public

// 获取提案详情
function getProposal(uint256 proposalId) public view returns (...)

// 检查是否已投票
function hasVoted(uint256 proposalId, address voter) public view returns (bool)

// 获取剩余时间
function getRemainingTime(uint256 proposalId) public view returns (uint256)
```

## 部署到生产环境

### 1. 部署到测试网/主网

在 `hardhat.config.js` 中配置网络：

```javascript
sepolia: {
  url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  accounts: [process.env.PRIVATE_KEY]
}
```

部署到测试网：

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. 部署 Frame 服务器

推荐使用 Vercel 或 Railway 部署：

**Vercel 部署：**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

**Railway 部署：**

1. 在 Railway 创建新项目
2. 连接 GitHub 仓库
3. 设置环境变量
4. 自动部署

### 3. 更新 Frame URL

部署后，更新 `.env` 中的 `FRAME_URL` 为生产 URL。

## 测试账户

Hardhat 本地节点预置的测试账户（每个账户有 10000 ETH）：

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
```

## 安全注意事项

⚠️ **重要提醒**：

1. **私钥安全**：
   - 永远不要提交 `.env` 文件到 Git
   - 生产环境使用硬件钱包或 KMS
   - 定期轮换密钥

2. **合约审计**：
   - 主网部署前务必进行专业审计
   - 充分测试所有边界情况
   - 使用 OpenZeppelin 等安全库

3. **访问控制**：
   - 考虑添加管理员权限
   - 实现紧急暂停机制
   - 设置合理的投票时长

## 扩展功能建议

- [ ] 添加多重签名验证
- [ ] 实现委托投票机制
- [ ] 支持加权投票（按代币持有量）
- [ ] 添加投票激励/奖励
- [ ] 集成 Farcaster 身份验证
- [ ] 支持多链部署
- [ ] 添加提案评论/讨论功能

## 常见问题

### Q: 如何在 Frame 中签名交易？

A: 当前 Frame 支持显示投票界面，实际的链上交易需要：
1. 集成钱包连接（如 Coinbase Wallet、Rainbow）
2. 使用 Frame Actions 触发交易
3. 或引导用户到 DApp 完成交易

### Q: 投票数据如何更新？

A: 服务器通过调用合约的 `getProposal()` 方法实时获取投票数据。

### Q: 如何防止重复投票？

A: 合约使用 `mapping` 记录每个地址的投票状态，已投票的地址无法再次投票。

## 技术栈

- **智能合约**: Solidity 0.8.20
- **开发框架**: Hardhat
- **Web 服务器**: Express.js
- **区块链交互**: ethers.js v6
- **Frame 协议**: Farcaster Frames vNext

## 参考资源

- [Farcaster Frames 文档](https://docs.farcaster.xyz/docs/frames/frames)
- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
