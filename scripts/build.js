const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Universal Comments 插件...\n');

// 1. 清理旧的构建文件
console.log('📁 清理构建目录...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// 2. 构建前端
console.log('⚛️ 构建前端代码...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 前端构建完成\n');
} catch (error) {
  console.error('❌ 前端构建失败:', error.message);
  process.exit(1);
}

// 3. 复制必要文件到 dist 目录
console.log('📋 复制插件文件...');
const filesToCopy = [
  { src: 'manifest.json', dest: 'manifest.json' },
  { src: 'src/content/content.css', dest: 'content.css' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    const destPath = path.join('dist', dest);
    fs.copyFileSync(src, destPath);
    console.log(`✅ 复制 ${src} -> ${destPath}`);
  } else {
    console.log(`⚠️ 文件不存在: ${src}`);
  }
});

// 4. 构建后端（可选）
console.log('\n🔧 构建后端代码...');
try {
  execSync('cd server && npm run build', { stdio: 'inherit' });
  console.log('✅ 后端构建完成\n');
} catch (error) {
  console.error('❌ 后端构建失败:', error.message);
  console.log('⚠️ 后端构建失败，但插件仍可使用\n');
}

// 5. 创建插件包
console.log('📦 创建插件包...');
try {
  const packageName = `universal-comments-${new Date().toISOString().slice(0, 10)}.zip`;
  execSync(`powershell Compress-Archive -Path dist/* -DestinationPath ${packageName}`, { stdio: 'inherit' });
  console.log(`✅ 插件包已创建: ${packageName}\n`);
} catch (error) {
  console.log('⚠️ 无法创建插件包，请手动压缩 dist 目录\n');
}

console.log('🎉 构建完成！');
console.log('\n📖 下一步：');
console.log('1. 打开 Chrome 浏览器');
console.log('2. 访问 chrome://extensions/');
console.log('3. 开启开发者模式');
console.log('4. 点击"加载已解压的扩展程序"');
console.log('5. 选择 dist 目录');
console.log('\n或者直接安装生成的 .zip 文件');
