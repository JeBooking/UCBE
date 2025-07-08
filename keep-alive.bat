@echo off
echo 🔄 Universal Comments 服务保活脚本
echo.

echo 📡 检查 Vercel 服务状态...
curl -s https://ucbe.vercel.app/health
echo.

echo 📊 检查 Supabase 连接...
curl -s "https://ucbe.vercel.app/api/comments?url=https://example.com"
echo.

echo ✅ 服务保活完成！
echo 💡 建议每周运行一次此脚本以保持 Supabase 项目活跃
echo.
pause
