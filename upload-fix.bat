@echo off
echo ========================================
echo   chenasir Language Translator
echo   GitHub Upload Fix Script
echo ========================================

echo.
echo Step 1: Check Git configuration...
git config user.name
git config user.email
echo [OK] Git user configuration checked

echo.
echo Step 2: Check repository status...
git status --porcelain
if %ERRORLEVEL% EQU 0 (
    echo [OK] Repository is clean
) else (
    echo [INFO] Repository has changes
)

echo.
echo Step 3: Try different remote URLs...
echo Removing existing remote...
git remote remove origin 2>nul

echo Testing GitHub connection methods...
echo.
echo Method 1: HTTPS (recommended)
git remote add origin https://github.com/chenasir/language-translator.git
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Upload completed via HTTPS!
    goto success
)

echo.
echo Method 2: HTTPS with token (if above failed)
echo Please visit: https://github.com/settings/tokens
echo Generate a Personal Access Token and use it as password
echo Then run: git push -u origin main
echo.

echo Method 3: Check if repository exists
echo Please ensure you have created the repository on GitHub:
echo https://github.com/chenasir/language-translator
echo.

echo Method 4: Alternative commands to try:
echo git remote set-url origin https://github.com/chenasir/language-translator.git
echo git push --set-upstream origin main
echo git push origin HEAD:main
echo.

:success
echo.
echo ========================================
echo          UPLOAD INSTRUCTIONS
echo ========================================
echo.
echo If upload was successful, your website will be at:
echo https://chenasir.github.io/language-translator/
echo.
echo To enable GitHub Pages:
echo 1. Go to https://github.com/chenasir/language-translator
echo 2. Click Settings
echo 3. Scroll to Pages section
echo 4. Select Source: Deploy from a branch
echo 5. Select Branch: main
echo 6. Click Save
echo.
echo Wait 5-10 minutes, then visit your website!
echo.
pause
