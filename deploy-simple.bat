@echo off
echo ========================================
echo     chenasir Language Translator
echo     GitHub Deployment Script
echo ========================================

echo.
echo Step 1: Initialize Git repository...
if not exist .git (
    git init
    echo [OK] Git repository initialized
) else (
    echo [OK] Git repository exists
)

echo.
echo Step 2: Add files...
git add .
echo [OK] Files added to staging area

echo.
echo Step 3: Commit changes...
git commit -m "Initial commit: chenasir Language Translator

Features:
- Multi-engine translation (DeepSeek/Tencent/Baidu/OpenAI)
- Optimized Cantonese voice synthesis
- Beautiful starry night UI design
- Mobile responsive design
- Secure API key management

Tech Stack:
- Frontend: HTML5 + CSS3 + JavaScript
- Backend: Node.js + Express
- Voice: Web Speech API
- UI: CSS animations + particle effects

Author: chenasir
Live Demo: https://chenasir.github.io/language-translator/"

if %ERRORLEVEL% NEQ 0 (
    echo [INFO] No new changes to commit
)

echo.
echo Step 4: Set remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/chenasir/language-translator.git
echo [OK] Remote repository configured

echo.
echo Step 5: Push to GitHub...
git branch -M main
echo Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo     DEPLOYMENT SUCCESSFUL!
    echo ================================
    echo.
    echo Your translation tool will be available at:
    echo https://chenasir.github.io/language-translator/
    echo.
    echo Next steps:
    echo 1. Visit https://github.com/chenasir/language-translator
    echo 2. Go to Settings - Pages
    echo 3. Select "Deploy from a branch" - "main"
    echo 4. Wait a few minutes and visit your website
    echo.
    echo Congratulations! Your open-source translator is live!
) else (
    echo.
    echo ================================
    echo       DEPLOYMENT FAILED
    echo ================================
    echo.
    echo Possible solutions:
    echo 1. Create repository 'language-translator' on GitHub first
    echo 2. Check internet connection
    echo 3. Verify GitHub username and permissions
    echo 4. Try manual push: git push -u origin main
)

echo.
pause
