@echo off
echo 🚀 开始部署 Universal Comments...

echo.
echo 📦 构建后端...
cd server
call npm run build
cd ..

echo.
echo 📦 构建前端...
call npm run build
copy manifest.json dist\
copy src\content\content.css dist\

echo.
echo ✅ 构建完成！
echo.
echo 📋 下一步：
echo 1. 在 GitHub 上创建新仓库 'comment_website'
echo 2. 运行以下命令推送代码：
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit: Universal Comments"
echo    git remote add origin https://github.com/你的用户名/comment_website.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 访问 vercel.com 连接 GitHub 仓库并部署
echo 4. 配置环境变量：SUPABASE_URL 和 SUPABASE_ANON_KEY
echo.
pause
