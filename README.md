# Universal Comments - 通用网页评论插件

一个为所有网页添加评论功能的浏览器插件，让用户可以在任何网站上查看和发表评论。

## 🌟 功能特性

- **通用评论系统** - 为任何网页添加评论功能
- **实时同步** - 多用户实时查看评论更新
- **用户身份识别** - 基于设备指纹的用户识别系统
- **点赞和回复** - 支持评论点赞和多级回复
- **样式隔离** - 确保插件UI不受网站样式影响
- **跨域支持** - 安全的跨域API通信
- **拖拽界面** - 可拖拽的评论面板

## 🏗️ 技术架构

### 前端（浏览器插件）
- **Manifest V3** - Chrome/Edge 插件标准
- **React + TypeScript** - 现代化UI框架
- **Webpack** - 模块打包工具
- **CSS隔离** - 防止样式冲突

### 后端服务
- **Node.js + Express** - RESTful API服务
- **TypeScript** - 类型安全开发
- **Supabase** - 数据库和实时功能
- **PostgreSQL** - 关系型数据库

## 📦 项目结构

```
comment_website/
├── src/                    # 插件前端代码
│   ├── components/         # React组件
│   ├── content/           # Content Script
│   ├── popup/             # 插件弹出页面
│   ├── types/             # TypeScript类型定义
│   └── utils/             # 工具函数
├── server/                # 后端API服务
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   └── config/        # 配置文件
│   └── package.json
├── database/              # 数据库架构
├── manifest.json          # 插件配置文件
└── package.json           # 前端依赖配置
```

## 🚀 快速开始

### 1. 环境准备

确保你已安装：
- Node.js (v16+)
- npm 或 yarn
- Supabase 账户

### 2. 克隆项目

```bash
git clone <repository-url>
cd comment_website
```

### 3. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

### 4. 配置数据库

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中执行 `database/schema.sql`
3. 复制 `server/.env.example` 为 `server/.env`
4. 填入你的 Supabase 配置：

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3000
NODE_ENV=development
```

### 5. 启动开发服务器

```bash
# 启动后端服务
cd server
npm run dev

# 在新终端启动前端构建
cd ..
npm run dev
```

### 6. 安装浏览器插件

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

## 🔧 开发指南

### 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端
cd server
npm run build
```

### 数据库管理

```sql
-- 查看评论统计
SELECT * FROM comment_statistics;

-- 清理孤立用户
SELECT cleanup_orphaned_users();

-- 查看带点赞数的评论
SELECT * FROM comments_with_likes WHERE url = 'https://example.com';
```

### API 端点

- `GET /api/comments?url=<page_url>` - 获取页面评论
- `POST /api/comments` - 创建新评论
- `POST /api/comments/:id/like` - 切换点赞状态
- `DELETE /api/comments/:id` - 删除评论

## 🛡️ 安全特性

- **输入验证** - 严格的数据验证和清理
- **限流保护** - 防止API滥用
- **CORS配置** - 安全的跨域访问控制
- **SQL注入防护** - 使用参数化查询
- **XSS防护** - 内容转义和CSP策略

## 📱 用户指南

### 使用插件

1. 点击浏览器工具栏中的插件图标
2. 设置你的用户名
3. 点击"显示评论"按钮
4. 在任何网页上查看和发表评论

### 功能说明

- **发表评论** - 在评论框中输入内容并点击发布
- **回复评论** - 点击评论下方的"回复"按钮
- **点赞评论** - 点击❤️图标为评论点赞
- **删除评论** - 只能删除自己发表的评论
- **拖拽面板** - 拖拽评论面板标题栏来移动位置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果你发现了bug或有功能建议，请在 [Issues](../../issues) 页面提交。

## 📞 联系方式

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目链接：[https://github.com/yourusername/universal-comments]
