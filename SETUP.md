# 环境配置指南

## 1. 安装 Node.js

### Windows 系统

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐 v18 或更高版本）
3. 运行安装程序，按默认设置安装
4. 安装完成后，重启命令行工具

### 验证安装

打开新的命令行窗口，运行：
```bash
node --version
npm --version
```

如果显示版本号，说明安装成功。

## 2. 设置 Supabase 数据库

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册账户并登录
3. 点击 "New Project"
4. 填写项目信息：
   - Name: `universal-comments`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域

### 配置数据库

1. 项目创建完成后，进入项目仪表板
2. 点击左侧菜单的 "SQL Editor"
3. 复制 `database/schema.sql` 文件的内容
4. 粘贴到 SQL 编辑器中并执行

### 获取连接信息

1. 在项目仪表板，点击左侧的 "Settings"
2. 选择 "API" 标签
3. 复制以下信息：
   - Project URL
   - anon public key

## 3. 配置环境变量

1. 进入 `server` 目录
2. 复制 `.env.example` 为 `.env`
3. 填入你的 Supabase 信息：

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
NODE_ENV=development
```

## 4. 安装项目依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

## 5. 启动开发服务器

```bash
# 启动后端服务（在 server 目录）
npm run dev

# 在新终端启动前端构建（在根目录）
npm run dev
```

## 6. 安装浏览器插件

### Chrome/Edge

1. 打开浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录
5. 插件安装完成后会出现在工具栏

### Firefox

1. 打开 Firefox，访问 `about:debugging`
2. 点击"此 Firefox"
3. 点击"临时载入附加组件"
4. 选择项目根目录下的 `manifest.json` 文件

## 7. 测试插件

1. 访问任意网站（如 https://example.com）
2. 点击浏览器工具栏中的插件图标
3. 设置用户名并点击"显示评论"
4. 尝试发表评论和点赞功能

## 常见问题

### Q: npm 命令不存在
A: 请确保已正确安装 Node.js，并重启命令行工具。

### Q: 插件无法加载
A: 检查 manifest.json 文件是否存在语法错误，确保所有依赖文件都已正确构建。

### Q: API 请求失败
A: 检查后端服务是否正常运行，确保 .env 文件配置正确。

### Q: 数据库连接失败
A: 验证 Supabase 配置信息是否正确，检查网络连接。

## 开发工具推荐

- **VS Code** - 代码编辑器
- **Chrome DevTools** - 调试插件
- **Postman** - API 测试
- **Supabase Dashboard** - 数据库管理

## 下一步

环境配置完成后，你可以：
1. 阅读 README.md 了解项目详情
2. 查看代码结构和实现细节
3. 根据需求自定义功能
4. 部署到生产环境
