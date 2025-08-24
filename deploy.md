# 🚀 部署指南

## GitHub Pages 部署

### 1. 创建GitHub仓库
```bash
# 1. 在GitHub上创建新仓库：language-translator
# 2. 克隆到本地
git clone https://github.com/chenasir/language-translator.git
cd language-translator

# 3. 添加文件
git add .
git commit -m "初始提交: 智能多语言翻译助手"
git push origin main
```

### 2. 启用GitHub Pages
1. 进入GitHub仓库设置
2. 滚动到"Pages"部分
3. 选择"Deploy from a branch"
4. 选择"main"分支
5. 点击"Save"

### 3. 访问你的网站
几分钟后，你的网站将在以下地址可用：
```
https://chenasir.github.io/language-translator/
```

## 其他部署选项

### Vercel 部署
1. 访问 [vercel.com](https://vercel.com)
2. 连接GitHub账号
3. 导入你的仓库
4. 自动部署完成

### Netlify 部署
1. 访问 [netlify.com](https://netlify.com)
2. 连接GitHub账号
3. 选择仓库并部署
4. 获得自定义域名

## 🔧 环境配置

### 前端部署（推荐）
适用于：GitHub Pages, Vercel, Netlify
- ✅ 支持: DeepSeek, 百度翻译, OpenAI
- ❌ 不支持: 腾讯翻译（需要后端代理）

### 全功能部署
需要Node.js服务器支持腾讯翻译：
```bash
npm install
node backend-server.js
```

## 🌐 自定义域名

### GitHub Pages + 自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名：`translator.yourdomain.com`
3. 在域名DNS设置中添加CNAME记录指向 `chenasir.github.io`

## 🔒 安全检查清单

- ✅ `.gitignore` 已创建
- ✅ 个人API密钥已清理
- ✅ 示例配置文件已创建
- ✅ README文档已更新
- ✅ 许可证文件已添加

## 📈 SEO优化

在 `index.html` 的 `<head>` 中添加：
```html
<meta name="description" content="免费的智能多语言翻译工具，支持中文到英文和粤语翻译，提供高质量语音朗读">
<meta name="keywords" content="翻译,粤语,英文,语音朗读,在线翻译">
<meta property="og:title" content="智能多语言翻译助手">
<meta property="og:description" content="支持多引擎翻译的美观网页工具">
<meta property="og:url" content="https://chenasir.github.io/language-translator/">
```
