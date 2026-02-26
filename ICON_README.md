# 图标说明

## 当前状态

项目包含 SVG 图标：`public/icon.svg`

## 添加 PNG 图标

`farcaster.json` 中引用的图标文件需要是 PNG 格式。你有以下选择：

### 选项 1: 使用在线工具转换

1. 访问 https://cloudconvert.com/svg-to-png
2. 上传 `public/icon.svg`
3. 转换为 512x512 PNG
4. 下载并重命名为 `icon.png`
5. 放在 `public/` 目录下

### 选项 2: 使用命令行工具

如果你安装了 ImageMagick：

```bash
cd public
magick icon.svg icon.png
```

### 选项 3: 使用 Base 默认图标

暂时使用 Base 的默认图标，不需要自定义图标。

### 选项 4: 移除图标引用

如果你不需要图标，可以从 `farcaster.json` 中删除 `iconUrl` 字段。

## 当前文件

- `public/icon.svg` - SVG 格式图标（已创建）
- `public/.well-known/farcaster.json` - 引用 `icon.png`
- `public/icon.png` - **需要创建**（PNG 格式）

## 验证

部署后，访问以下 URL 验证：
- https://farcaster-voting-frame.vercel.app/icon.png

## 下一步

1. 创建 `icon.png` 文件
2. 放在 `public/` 目录
3. 重新部署到 Vercel
4. 在 base.dev 完成验证
