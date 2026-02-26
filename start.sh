#!/bin/bash

echo "🚀 启动 Farcaster 投票 Frame 开发环境"
echo "========================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 复制环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件填写配置"
fi

# 启动 Hardhat 节点（后台）
echo "🔗 启动 Hardhat 本地节点..."
npx hardhat node > /dev/null 2>&1 &
HARDHAT_PID=$!
echo "  PID: $HARDHAT_PID"

# 等待节点启动
sleep 3

# 编译合约
echo "🔨 编译合约..."
npx hardhat compile > /dev/null 2>&1

# 部署合约
echo "📜 部署投票合约..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost 2>&1)
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "0x[a-fA-F0-9]\{40\}" | head -1)

if [ -n "$CONTRACT_ADDRESS" ]; then
    # 更新 .env 文件
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VOTING_CONTRACT_ADDRESS=.*/VOTING_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
    else
        # Linux
        sed -i "s/VOTING_CONTRACT_ADDRESS=.*/VOTING_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
    fi
    echo "✅ 合约已部署: $CONTRACT_ADDRESS"
else
    echo "❌ 合约部署失败"
    kill $HARDHAT_PID 2>/dev/null
    exit 1
fi

# 启动服务器
echo ""
echo "🌐 启动 Frame 服务器..."
echo "========================================"
echo ""
echo "✅ 开发环境已就绪！"
echo ""
echo "📍 服务地址:"
echo "   - Frame: http://localhost:3000"
echo "   - API: http://localhost:3000/api/proposal?id=1"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"
echo ""

# 启动 Express 服务器
node server.js

# 清理：关闭 Hardhat 节点
echo ""
echo "🛑 停止 Hardhat 节点..."
kill $HARDHAT_PID 2>/dev/null
