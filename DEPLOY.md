# 部署指南

## 🚀 使用 Vercel 部署后端

### 1. 准备工作
确保你已经：
- ✅ 有 GitHub 账户
- ✅ 有 Vercel 账户（可以用 GitHub 登录）
- ✅ 项目代码已推送到 GitHub

### 2. 部署到 Vercel

#### 方法A：通过 Vercel 网站部署
1. 访问 [vercel.com](https://vercel.com)
2. 用 GitHub 账户登录
3. 点击 "New Project"
4. 选择你的 `comment_website` 仓库
5. 配置环境变量：
   - `SUPABASE_URL`: 你的 Supabase 项目 URL
   - `SUPABASE_ANON_KEY`: 你的 Supabase anon key
   - `NODE_ENV`: production
6. 点击 "Deploy"

#### 方法B：通过 Vercel CLI 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 3. 配置环境变量
在 Vercel 项目设置中添加：
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
```

### 4. 获取部署地址
部署成功后，你会得到一个地址，类似：
`https://comment-website-xxx.vercel.app`

### 5. 更新前端配置
修改 `src/utils/api.ts`：
```typescript
const API_BASE_URL = 'https://your-vercel-app.vercel.app/api';
```

### 6. 重新构建插件
```bash
npm run build:all
```

## 🔧 其他部署选项

### Railway
1. 访问 [railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 设置环境变量
4. 部署

### Heroku
1. 创建 `Procfile`：
```
web: cd server && npm start
```
2. 部署到 Heroku
3. 设置环境变量

## 📱 发布插件

### Chrome Web Store
1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 支付 $5 注册费
3. 上传插件包
4. 填写应用信息
5. 提交审核

### Firefox Add-ons
1. 访问 [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. 上传插件包
3. 提交审核

## 🧪 测试部署

部署完成后测试：
1. 访问 `https://your-app.vercel.app/health`
2. 应该返回健康检查信息
3. 安装更新后的插件
4. 测试评论功能

## 🔍 故障排查

### 常见问题
1. **CORS 错误** - 检查 CORS 配置
2. **环境变量** - 确保 Supabase 配置正确
3. **构建失败** - 检查依赖和构建脚本

### 查看日志
在 Vercel 仪表板中查看函数日志来调试问题。
