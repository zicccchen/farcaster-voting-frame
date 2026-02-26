# Base 网络部署指南

本指南帮助你将 Farcaster 投票 Frame 部署到 Base 网络。

## 网络选择

### Base Sepolia 测试网（推荐）
- Chain ID: 84532
- 免费部署
- 获取测试 ETH: https://faucet.quicknode.com/base
- 区块浏览器: https://sepolia.basescan.org

### Base 主网
- Chain ID: 8453
- 需要真实 ETH（Gas 费约 $0.001-0.01）
- 区块浏览器: https://basescan.org

## 部署步骤

### 1. 准备钱包

如果你还没有钱包，需要：
- 安装 MetaMask 或其他 Web3 钱包
- 创建或导入钱包账户
- 获取 ETH（测试网或主网）

#### 获取测试 ETH (Base Sepolia)
访问以下水龙头：
- https://faucet.quicknode.com/base
- https://www.coinbase.com/cloud/web3/actions/base-sepolia-faucet

#### 获取主网 ETH
- 从交易所购买 ETH
- 跨链桥接到 Base: https://bridge.base.org

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 你的钱包私钥（不要包含 0x 前缀或 0x 开头都可以）
PRIVATE_KEY=你的私钥

# RPC URL（可选，使用默认公共节点）
# Base Sepolia
# RPC_URL=https://sepolia.base.org

# Base 主网
# RPC_URL=https://mainnet.base.org

# 合约地址（部署后填写）
VOTING_CONTRACT_ADDRESS=

# Frame URL（部署后更新）
FRAME_URL=https://your-domain.com
```

**⚠️ 安全提示**：
- 永远不要提交 `.env` 文件到 Git
- 建议使用专门的部署账户，不要用主钱包
- 部署前备份私钥

### 3. 编译合约

```bash
npx hardhat compile
```

### 4. 部署到 Base Sepolia 测试网

```bash
npm run deploy:base:testnet
```

或者：

```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

### 5. 部署到 Base 主网（可选）

```bash
npm run deploy:base:mainnet
```

或者：

```bash
npx hardhat run scripts/deploy-base.js --network base
```

## 验证部署

部署成功后，你会看到：

```
✅ Voting 合约已部署!
📍 合约地址: 0x...
🔗 浏览器: https://sepolia.basescan.org/address/0x...
```

### 在区块浏览器中查看

1. 复制合约地址
2. 在 BaseScan 中搜索
3. 查看 Contract 标签页
4. 验证合约代码（可选）

## 更新配置

部署成功后：

1. **更新 .env 文件**：
```env
VOTING_CONTRACT_ADDRESS=你的合约地址
```

2. **更新 FRAME_URL**（如果部署到生产环境）：
```env
FRAME_URL=https://your-vercel-app.vercel.app
```

3. **重启服务器**：
```bash
node server.js
```

## Gas 费用参考

| 网络 | 部署费用 | 投票交易 |
|------|---------|---------|
| Base Sepolia | 免费 | ~$0.0001 |
| Base 主网 | ~$0.50-2 | ~$0.001 |

## 测试部署

### 测试合约交互

```bash
# 运行测试脚本
node test-vote.js
```

### 测试 API

```bash
# 查询提案
curl https://your-domain.com/api/proposal?id=1

# 查看 Frame 图片
curl https://your-domain.com/api/og?proposalId=1
```

## 生产环境部署

### 1. 部署 Frame 服务器

推荐平台：
- **Vercel** (免费): `vercel deploy`
- **Railway** (免费额度): railway.app
- **Render** (免费额度): render.com

### 2. 配置环境变量

在部署平台设置：
```
VOTING_CONTRACT_ADDRESS=你的合约地址
RPC_URL=https://mainnet.base.org
FRAME_URL=https://your-domain.com
```

### 3. 更新 Frame URL

在 Farcaster Cast 中使用你的生产 URL：
```
https://your-domain.com
```

## 常见问题

### Q: 部署失败 "insufficient funds"
A: 确保钱包有足够的 ETH。Base 主网至少需要 0.01 ETH。

### Q: 交易卡住
A: 检查 Gas 费用设置，Base 主网通常使用：
- Gas Price: ~0.1 gwei
- Gas Limit: 自动估算

### Q: 如何验证合约？
A: 在 BaseScan 上，Contract → Verify and Publish

### Q: 可以升级合约吗？
A: 当前版本不可升级。如需升级功能，建议：
1. 使用代理合约模式
2. 部署新合约
3. 迁移数据

## 安全检查清单

- [ ] 使用测试网充分测试
- [ ] 主网部署账户分离
- [ ] 备份私钥到安全位置
- [ ] 验证合约源代码（可选但推荐）
- [ ] 设置监控和告警
- [ ] 准备应急预案

## 有用的链接

- Base 官网: https://base.org
- Base 文档: https://docs.base.org
- Base 测试网水龙头: https://faucet.quicknode.com/base
- Base 浏览器: https://basescan.org
- Base 桥接: https://bridge.base.org

## 支持

遇到问题？
- 查看 Hardhat 文档
- 检查 Base 状态页
- 提交 Issue 到项目仓库
