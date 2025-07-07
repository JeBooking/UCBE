@echo off
echo 🚀 Universal Comments 插件快速安装脚本
echo.

echo 📦 正在构建插件...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo 📋 复制必要文件...
copy manifest.json dist\
copy src\content\content.css dist\

echo 📦 创建插件包...
powershell Compress-Archive -Path dist\* -DestinationPath universal-comments-plugin.zip -Force

echo.
echo ✅ 插件构建完成！
echo.
echo 📋 安装说明：
echo 1. 解压 universal-comments-plugin.zip
echo 2. 打开 Chrome 浏览器
echo 3. 访问 chrome://extensions/
echo 4. 开启"开发者模式"
echo 5. 点击"加载已解压的扩展程序"
echo 6. 选择解压后的文件夹
echo.
echo 📁 插件包位置: %cd%\universal-comments-plugin.zip
echo.

echo 🌐 要自动打开安装页面吗？(y/n)
set /p choice=
if /i "%choice%"=="y" (
    start chrome://extensions/
)

echo.
echo 🎉 安装完成后，插件就可以在任何网页上使用了！
pause
