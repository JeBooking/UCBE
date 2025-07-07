# 部署指南

## 🚀 生产环境部署

### 1. 后端服务部署

#### 使用 Vercel 部署

1. 在项目根目录创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server/src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. 安装 Vercel CLI：
```bash
npm i -g vercel
```

3. 部署：
```bash
vercel --prod
```

4. 在 Vercel 仪表板设置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

#### 使用 Railway 部署

1. 连接 GitHub 仓库到 Railway
2. 设置构建命令：`cd server && npm install && npm run build`
3. 设置启动命令：`cd server && npm start`
4. 配置环境变量

#### 使用 Heroku 部署

1. 创建 `Procfile`：
```
web: cd server && npm start
```

2. 部署：
```bash
heroku create your-app-name
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
git push heroku main
```

### 2. 前端插件发布

#### Chrome Web Store

1. 构建生产版本：
```bash
npm run build:all
```

2. 创建开发者账户：
   - 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - 支付一次性注册费用 $5

3. 准备发布材料：
   - 插件图标（16x16, 48x48, 128x128）
   - 应用截图（1280x800 或 640x400）
   - 详细描述
   - 隐私政策

4. 上传插件包：
   - 压缩 `dist` 目录为 ZIP 文件
   - 上传到 Chrome Web Store
   - 填写应用信息
   - 提交审核

#### Firefox Add-ons

1. 修改 `manifest.json` 兼容 Firefox：
```json
{
  "manifest_version": 2,
  "browser_specific_settings": {
    "gecko": {
      "id": "universal-comments@yourname.com"
    }
  }
}
```

2. 访问 [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
3. 上传插件包并提交审核

### 3. 域名和SSL配置

#### 自定义域名

1. 购买域名（推荐使用 Cloudflare）
2. 配置 DNS 记录指向部署服务
3. 启用 SSL/TLS 加密

#### 更新插件配置

更新 `manifest.json` 中的 `host_permissions`：
```json
{
  "host_permissions": [
    "https://your-api-domain.com/*"
  ]
}
```

更新前端 API 配置：
```typescript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

## 🔧 生产环境优化

### 1. 性能优化

#### 前端优化
- 启用代码分割
- 压缩图片资源
- 使用 CDN 加速
- 实现懒加载

#### 后端优化
- 启用 Gzip 压缩
- 实现 API 缓存
- 数据库查询优化
- 连接池配置

### 2. 安全加固

#### API 安全
```typescript
// 添加更严格的限流
const productionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 生产环境更严格
  message: 'Too many requests'
});

// 添加请求验证
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

#### 数据库安全
- 启用 Row Level Security (RLS)
- 定期备份数据
- 监控异常访问

### 3. 监控和日志

#### 错误监控
```typescript
// 集成 Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

#### 性能监控
- 使用 New Relic 或 DataDog
- 监控 API 响应时间
- 跟踪用户行为

## 📊 运维管理

### 1. 数据库维护

```sql
-- 定期清理过期数据
DELETE FROM comments 
WHERE created_at < NOW() - INTERVAL '1 year';

-- 优化数据库性能
VACUUM ANALYZE comments;
VACUUM ANALYZE likes;
VACUUM ANALYZE users;

-- 监控数据库大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### 2. 备份策略

#### 自动备份
- 配置 Supabase 自动备份
- 定期导出重要数据
- 测试恢复流程

#### 灾难恢复
- 准备备用服务器
- 文档化恢复步骤
- 定期演练

### 3. 更新发布

#### 版本管理
```bash
# 更新版本号
npm version patch  # 或 minor, major

# 构建新版本
npm run build:all

# 发布到商店
# (手动上传到 Chrome Web Store 和 Firefox Add-ons)
```

#### 灰度发布
- 先发布给小部分用户
- 监控错误率和性能
- 逐步扩大发布范围

## 🔍 故障排查

### 常见问题

1. **API 连接失败**
   - 检查服务器状态
   - 验证 CORS 配置
   - 确认 SSL 证书有效

2. **插件无法加载**
   - 检查 manifest.json 语法
   - 验证权限配置
   - 查看浏览器控制台错误

3. **数据库连接问题**
   - 检查 Supabase 配置
   - 验证网络连接
   - 查看数据库日志

### 监控指标

- API 响应时间
- 错误率
- 用户活跃度
- 数据库性能
- 服务器资源使用

## 📈 扩展计划

### 功能扩展
- 评论搜索功能
- 用户关注系统
- 评论标签分类
- 多语言支持
- 移动端适配

### 技术升级
- 迁移到 Manifest V3
- 实现 PWA 版本
- 添加离线支持
- 集成 AI 内容审核
