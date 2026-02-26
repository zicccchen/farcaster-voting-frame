# Vercel 部署指南

## 🚀 快速部署

### 方式一：命令行部署（推荐）

1. **登录 Vercel**
   ```bash
   cd farcaster-voting-frame
   npx vercel login
   ```
   这会打开浏览器进行授权。

2. **部署项目**
   ```bash
   npx vercel --prod
   ```

3. **设置环境变量**
   部署时 Vercel 会自动读取 `vercel.json` 中的配置：
   - `VOTING_CONTRACT_ADDRESS`: `0xa335dF4691c4Db8389D311963Cb57Ddd747924C9`
   - `RPC_URL`: `https://mainnet.base.org`

4. **获取部署 URL**
   部署完成后，Vercel 会提供一个 URL，例如：
   ```
   https://farcaster-voting-frame-xxx.vercel.app
   ```

5. **更新 FRAME_URL**
   部署成功后，需要添加 `FRAME_URL` 环境变量：
   ```bash
   npx vercel env add FRAME_URL production
   # 输入你的完整 URL，如：https://your-app.vercel.app
   ```

6. **重新部署**
   ```bash
   npx vercel --prod
   ```

### 方式二：通过 Vercel 网站部署

1. 访问 [vercel.com](https://vercel.com)
2. 登录或注册账号
3. 点击 "Add New Project"
4. 导入 GitHub 仓库或上传项目
5. 配置环境变量：
   ```
   VOTING_CONTRACT_ADDRESS=0xa335dF4691c4Db8389D311963Cb57Ddd747924C9
   RPC_URL=https://mainnet.base.org
   FRAME_URL=https://your-app.vercel.app
   ```
6. 点击 "Deploy"

## 📋 部署前检查清单

- [ ] 已登录 Vercel 账号
- [ ] `vercel.json` 配置正确
- [ ] Base 合约地址已确认
- [ ] `.vercelignore` 文件已创建（避免上传敏感文件）

## 🔧 环境变量说明

| 变量 | 值 | 说明 |
|------|-----|------|
| `VOTING_CONTRACT_ADDRESS` | `0xa335dF4691c4Db8389D311963Cb57Ddd747924C9` | Base 主网合约地址 |
| `RPC_URL` | `https://mainnet.base.org` | Base RPC 节点 |
| `FRAME_URL` | 你的部署 URL | Frame 完整 URL（用于图片元数据） |

## 📊 部署后验证

部署完成后，访问以下 URL 验证：

1. **主页**: `https://your-app.vercel.app/`
2. **API**: `https://your-app.vercel.app/api/proposal?id=1`
3. **Frame 图片**: `https://your-app.vercel.app/api/og?proposalId=1`

## 🔄 更新部署

当你修改代码后：

```bash
# 预览部署（不更新生产环境）
npx vercel

# 生产部署
npx vercel --prod
```

## 🌐 自定义域名

在 Vercel 控制台：
1. 进入项目设置
2. 点击 "Domains"
3. 添加自定义域名

## 💰 费用

Vercel 免费套餐包括：
- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ Serverless Functions
- ✅ 自动 HTTPS

对于 Farcaster Frame 使用场景，免费套餐完全足够！

## 🐛 常见问题

### Q: 部署后 API 返回错误？
A: 检查环境变量是否正确设置，特别是 `VOTING_CONTRACT_ADDRESS`。

### Q: Frame 图片显示不正确？
A: 确保 `FRAME_URL` 环境变量已设置为完整的 HTTPS URL。

### Q: 如何查看部署日志？
A:
```bash
npx vercel logs
```

### Q: 如何删除部署？
A: 在 Vercel 控制台的项目页面可以删除部署。

## 📚 相关链接

- Vercel 文档: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli
- Frame 验证工具: https://warpcast.com/~/developers/frames

## ✅ 部署成功后

1. 在 Warpcast 中测试你的 Frame
2. 分享给社区进行投票
3. 在 Farcaster 上发布 Cast 宣布你的 Frame

🎉 恭喜！你的 Farcaster 投票 Frame 现已上线！
