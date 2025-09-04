@echo off
echo 🚀 正在初始化Git仓库...

git init
echo ✅ Git仓库已初始化

git add .gitignore
git add LICENSE
git add README_GitHub.md
git add config.example.json
git add deploy.md
git add index.html
git add style.css
git add script.js
git add package.json
git add backend-server.js
git add *.md

echo ✅ 文件已添加到暂存区

git commit -m "🎉 初始提交: 智能多语言翻译助手

✨ 功能特性:
- 🌐 多引擎翻译 (DeepSeek/腾讯/百度/OpenAI)
- 🎙️ 智能语音朗读 (优化粤语支持)
- 🌌 酷炫星空界面设计
- 📱 响应式移动端适配
- 🔐 隐私保护 (本地存储API密钥)

🛠️ 技术栈:
- 前端: HTML5 + CSS3 + JavaScript
- 后端: Node.js + Express
- 语音: Web Speech API
- UI: 原生CSS动画 + 粒子效果"

echo ✅ 提交完成

echo.
echo 🌟 下一步操作:
echo 1. 在GitHub创建新仓库 'language-translator'
echo 2. 运行: git remote add origin https://github.com/chenasir/language-translator.git
echo 3. 运行: git branch -M main
echo 4. 运行: git push -u origin main
echo 5. 在GitHub仓库设置中启用GitHub Pages
echo.
echo 📖 详细部署指南请查看 deploy.md 文件
pause
