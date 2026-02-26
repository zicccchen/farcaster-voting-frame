const express = require("express");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 合约 ABI (只包含我们需要的方法)
const VOTING_ABI = [
    "function getProposal(uint256 proposalId) external view returns (uint256 id, string memory title, string memory description, uint256 yesVotes, uint256 noVotes, uint256 endTime, bool active, address creator)",
    "function vote(uint256 proposalId, bool support) external",
    "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
    "function getRemainingTime(uint256 proposalId) external view returns (uint256)"
];

// 设置提供者
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

// 如果有私钥，创建钱包（用于发送交易）
let wallet;
if (process.env.PRIVATE_KEY) {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

// 获取合约实例
function getContract() {
    if (!process.env.VOTING_CONTRACT_ADDRESS) {
        throw new Error("VOTING_CONTRACT_ADDRESS not set in .env");
    }
    return new ethers.Contract(process.env.VOTING_CONTRACT_ADDRESS, VOTING_ABI, provider);
}

app.use(express.json());
app.use(express.static("public"));

// Farcaster 验证文件路由（确保 .well-known 文件可访问）
app.get("/.well-known/farcaster.json", (req, res) => {
    res.sendFile(path.join(__dirname, "public", ".well-known", "farcaster.json"));
});

// Icon 路由（确保 icon.png 可访问）
app.get("/icon.png", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "icon.png"));
});

// 主页 - 显示 Frame（动态替换环境变量）
app.get("/", async (req, res) => {
    try {
        const fs = require('fs');
        let html = fs.readFileSync(path.join(__dirname, "public", "frame.html"), 'utf8');

        // 替换模板变量
        const frameUrl = process.env.FRAME_URL || `${req.protocol}://${req.get('host')}`;
        html = html.replace(/\$\{FRAME_URL\}/g, frameUrl);
        html = html.replace(/\$\{proposalId\}/g, '1');
        html = html.replace(/\$\{proposalTitle\}/g, 'Base 生态投票');
        html = html.replace(/\$\{proposalDesc\}/g, '在 Base 链上进行投票');

        // 移除 meta 标签中的换行符确保 URL 完整
        html = html.replace(/(<meta[^>]*?)\s*\n\s*/g, '$1 ');

        res.send(html);
    } catch (error) {
        console.error("Error serving page:", error);
        res.status(500).send("Error loading page");
    }
});

// 获取提案信息 API
app.get("/api/proposal", async (req, res) => {
    try {
        const proposalId = req.query.id || 1;
        const contract = getContract();

        const [
            id,
            title,
            description,
            yesVotes,
            noVotes,
            endTime,
            active
        ] = await contract.getProposal(proposalId);

        const remainingTime = await contract.getRemainingTime(proposalId);
        const remainingMinutes = Math.floor(Number(remainingTime) / 60);

        res.json({
            id: id.toString(),
            title,
            description,
            yesVotes: yesVotes.toString(),
            noVotes: noVotes.toString(),
            endTime: endTime.toString(),
            active,
            remainingTime: remainingMinutes > 0 ? `${remainingMinutes} 分钟` : "已结束"
        });
    } catch (error) {
        console.error("获取提案失败:", error);
        res.status(500).json({ error: error.message });
    }
});

// Frame: 获取初始图片
app.get("/api/og", async (req, res) => {
    try {
        const proposalId = req.query.proposalId || 1;
        const contract = getContract();

        const [id, title, description, yesVotes, noVotes, endTime, active, creator] = await contract.getProposal(proposalId);

        // 转换为字符串
        const titleStr = String(title);
        const yesVotesStr = yesVotes.toString();
        const noVotesStr = noVotes.toString();

        // 生成 SVG 图片
        const svg = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea"/>
                    <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
            </defs>

            <rect width="600" height="400" fill="url(#bg)"/>

            <rect x="30" y="30" width="540" height="340" rx="15" fill="white" opacity="0.95"/>

            <text x="50" y="70" font-family="Arial" font-size="28" font-weight="bold" fill="#333">
                🗳️ 链上投票
            </text>

            <text x="50" y="100" font-family="Arial" font-size="14" fill="#666">
                提案 #${proposalId}
            </text>

            <text x="50" y="140" font-family="Arial" font-size="16" font-weight="600" fill="#333">
                ${titleStr.substring(0, 40)}${titleStr.length > 40 ? '...' : ''}
            </text>

            <rect x="50" y="170" width="220" height="100" rx="10" fill="#dcfce7"/>
            <text x="160" y="200" font-family="Arial" font-size="14" fill="#166534" text-anchor="middle">
                赞成票
            </text>
            <text x="160" y="240" font-family="Arial" font-size="36" font-weight="bold" fill="#10b981" text-anchor="middle">
                ${yesVotesStr}
            </text>

            <rect x="330" y="170" width="220" height="100" rx="10" fill="#fee2e2"/>
            <text x="440" y="200" font-family="Arial" font-size="14" fill="#991b1b" text-anchor="middle">
                反对票
            </text>
            <text x="440" y="240" font-family="Arial" font-size="36" font-weight="bold" fill="#ef4444" text-anchor="middle">
                ${noVotesStr}
            </text>

            <text x="300" y="330" font-family="Arial" font-size="14" fill="#666" text-anchor="middle">
                点击下方按钮进行投票 →
            </text>
        </svg>
        `;

        res.set("Content-Type", "image/svg+xml");
        res.send(svg);
    } catch (error) {
        console.error("生成图片失败:", error);
        res.status(500).send("Error generating image");
    }
});

// Frame: 处理投票交互
app.post("/api/vote", async (req, res) => {
    try {
        const { untrustedData } = req.body;
        const buttonIndex = untrustedData?.buttonIndex;
        const proposalId = 1; // 默认提案 ID

        const contract = getContract();

        if (buttonIndex === 1) {
            // 赞成票
            const [title, yesVotes, noVotes] = await contract.getProposal(proposalId);

            res.json({
                type: "frame",
                frameUrl: `${process.env.FRAME_URL}/api/result?support=true&proposalId=${proposalId}`
            });
        } else if (buttonIndex === 2) {
            // 反对票
            res.json({
                type: "frame",
                frameUrl: `${process.env.FRAME_URL}/api/result?support=false&proposalId=${proposalId}`
            });
        } else if (buttonIndex === 3) {
            // 查看结果
            res.json({
                type: "frame",
                frameUrl: `${process.env.FRAME_URL}/api/result?view=true&proposalId=${proposalId}`
            });
        }
    } catch (error) {
        console.error("处理投票失败:", error);
        res.status(500).json({ error: error.message });
    }
});

// Frame: 显示投票结果
app.get("/api/result", async (req, res) => {
    try {
        const { support, view, proposalId } = req.query;
        const contract = getContract();

        const [id, title, description, yesVotes, noVotes, endTime, active, creator] = await contract.getProposal(proposalId || 1);

        const titleStr = String(title);
        const totalVotes = Number(yesVotes) + Number(noVotes);
        const yesPercent = totalVotes > 0 ? ((Number(yesVotes) / totalVotes) * 100).toFixed(1) : 0;
        const noPercent = totalVotes > 0 ? ((Number(noVotes) / totalVotes) * 100).toFixed(1) : 0;

        let message = "📊 投票结果";
        if (support === "true") message = "✅ 你投了赞成票!";
        if (support === "false") message = "❌ 你投了反对票!";

        // 生成结果 SVG
        const svg = `
        <svg width="600" height="450" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea"/>
                    <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
            </defs>

            <rect width="600" height="450" fill="url(#bg)"/>
            <rect x="30" y="30" width="540" height="390" rx="15" fill="white" opacity="0.95"/>

            <text x="300" y="70" font-family="Arial" font-size="24" font-weight="bold" fill="#333" text-anchor="middle">
                ${message}
            </text>

            <text x="300" y="100" font-family="Arial" font-size="14" fill="#666" text-anchor="middle">
                ${titleStr.substring(0, 50)}${titleStr.length > 50 ? '...' : ''}
            </text>

            <!-- 赞成票进度条 -->
            <rect x="50" y="140" width="500" height="40" rx="8" fill="#e5e7eb"/>
            <rect x="50" y="140" width="${500 * (yesPercent / 100)}" height="40" rx="8" fill="#10b981"/>
            <text x="300" y="167" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
                赞成 ${yesVotes} (${yesPercent}%)
            </text>

            <!-- 反对票进度条 -->
            <rect x="50" y="200" width="500" height="40" rx="8" fill="#e5e7eb"/>
            <rect x="50" y="200" width="${500 * (noPercent / 100)}" height="40" rx="8" fill="#ef4444"/>
            <text x="300" y="227" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
                反对 ${noVotes} (${noPercent}%)
            </text>

            <text x="300" y="280" font-family="Arial" font-size="18" fill="#333" text-anchor="middle">
                总票数: ${totalVotes}
            </text>

            <text x="300" y="320" font-family="Arial" font-size="14" fill="#666" text-anchor="middle">
                在 Farcaster Cast 中点击按钮完成链上投票
            </text>

            <rect x="200" y="350" width="200" height="40" rx="20" fill="#8b5cf6"/>
            <text x="300" y="378" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
                返回投票
            </text>
        </svg>
        `;

        // 返回 Frame 元数据
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" />
            <meta property="fc:frame:button:1" content="🔄 返回投票" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="${process.env.FRAME_URL}/" />
        </head>
        </html>
        `;

        res.set("Content-Type", "text/html");
        res.send(html);
    } catch (error) {
        console.error("生成结果失败:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Frame 服务器运行在 http://localhost:${PORT}`);
    console.log(`📄 查看 Frame: http://localhost:${PORT}`);
    console.log(`\n⚠️  请确保:`);
    console.log(`   1. 合约已部署并设置 VOTING_CONTRACT_ADDRESS`);
    console.log(`   2. .env 文件配置正确`);
    console.log(`   3. 本地节点运行中 (npx hardhat node)\n`);
});
