@echo off
echo 正在上传到GitHub...

git init
git add .
git commit -m "Initial commit: Language Translator"
git branch -M main
git remote add origin https://github.com/chenasir/language-translator.git
git push -u origin main

echo 完成！
pause
