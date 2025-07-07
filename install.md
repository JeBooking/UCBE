# Universal Comments 插件安装指南

## 🚀 快速安装

### 方法1：下载预构建版本

1. **下载插件包**
   - [点击下载 universal-comments-plugin.zip](https://github.com/JeBooking/UCBE/releases/latest)
   - 或者从项目页面下载 `dist` 文件夹

2. **解压文件**
   - 将 zip 文件解压到任意位置
   - 记住解压的文件夹位置

3. **安装到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹
   - 插件安装完成！

### 方法2：从源码构建

1. **克隆项目**
   ```bash
   git clone https://github.com/JeBooking/UCBE.git
   cd UCBE
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建插件**
   ```bash
   npm run build
   copy manifest.json dist\
   copy src\content\content.css dist\
   ```

4. **安装到浏览器**
   - 在 Chrome 中加载 `dist` 文件夹

## 🎯 使用方法

1. **设置用户名**
   - 点击浏览器工具栏中的插件图标
   - 输入你的用户名并保存

2. **查看和发表评论**
   - 在任意网页上点击插件图标
   - 点击"显示评论"
   - 查看其他用户的评论或发表新评论

3. **功能特性**
   - ✅ 为任何网页添加评论功能
   - ✅ 实时同步，多用户共享
   - ✅ 支持点赞和回复
   - ✅ 按网页URL隔离评论
   - ✅ 可拖拽的评论面板

## 🔧 故障排查

### 插件无法加载
- 确保已开启"开发者模式"
- 检查文件夹中是否包含 `manifest.json`
- 尝试刷新插件

### 评论无法显示
- 检查网络连接
- 确保不是在 `chrome://` 等特殊页面
- 尝试刷新页面后重新打开插件

### 无法发表评论
- 确保已设置用户名
- 检查评论内容不为空
- 尝试刷新页面

## 📞 支持

如有问题，请访问：
- GitHub Issues: https://github.com/JeBooking/UCBE/issues
- 项目主页: https://github.com/JeBooking/UCBE

## 🔄 更新插件

当有新版本时：
1. 下载最新的插件包
2. 在 `chrome://extensions/` 中删除旧版本
3. 重新安装新版本

---

**注意：** 这是一个开源项目，插件代码完全透明，可以自由查看和修改。
