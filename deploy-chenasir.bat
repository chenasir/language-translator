@echo off
echo 🚀 chenasir 的翻译工具 GitHub 部署脚本
echo ==========================================

echo.
echo 🌟 步骤1: 初始化Git仓库...
if not exist .git (
    git init
    echo ✅ Git仓库已初始化
) else (
    echo ✅ Git仓库已存在
)

echo.
echo 🌟 步骤2: 添加文件到暂存区...
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
git add "*.md"
echo ✅ 文件已添加

echo.
echo 🌟 步骤3: 提交代码...
git commit -m "🎉 chenasir的智能翻译工具首次发布

✨ 主要特性:
- 🌐 多引擎翻译支持 (DeepSeek/腾讯/百度/OpenAI)
- 🎙️ 优化的粤语语音朗读
- 🌌 酷炫星空界面设计  
- 📱 完美的移动端适配
- 🔐 安全的API密钥管理

🛠️ 技术亮点:
- 原生JavaScript + CSS3动画
- Web Speech API语音合成
- 响应式设计 + 粒子特效
- 多API集成 + 智能错误处理

🌟 作者: chenasir
📱 在线体验: https://chenasir.github.io/language-translator/"

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 没有新的更改需要提交
) else (
    echo ✅ 代码已提交
)

echo.
echo 🌟 步骤4: 设置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/chenasir/language-translator.git
echo ✅ 远程仓库已设置

echo.
echo 🌟 步骤5: 推送到GitHub...
git branch -M main
echo 正在推送到 GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 部署成功！
    echo.
    echo 🌐 你的翻译工具将在几分钟后可用:
    echo 👉 https://chenasir.github.io/language-translator/
    echo.
    echo 🔧 下一步操作:
    echo 1. 访问 https://github.com/chenasir/language-translator
    echo 2. 进入 Settings → Pages
    echo 3. 选择 "Deploy from a branch" → "main"
    echo 4. 等待几分钟后访问你的网站
    echo.
    echo 🌟 恭喜! 你的开源翻译工具已经上线！
) else (
    echo.
    echo ❌ 推送失败!
    echo.
    echo 🔧 可能的解决方案:
    echo 1. 检查网络连接
    echo 2. 确认已在GitHub创建仓库 'language-translator'
    echo 3. 检查GitHub用户名和权限
    echo 4. 手动运行: git push -u origin main
)

echo.
pause
