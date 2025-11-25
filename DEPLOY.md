# 前端部署指南

## 🚀 部署到 Vercel（推荐）

### 为什么选择 Vercel？
- ✅ 免费且快速
- ✅ 自动 HTTPS
- ✅ 自动部署（GitHub 推送后自动部署）
- ✅ 与后端在同一平台，管理方便
- ✅ 支持 Vue.js/Vite 项目

---

## 📋 部署步骤

### 步骤 1: 准备代码

1. **确保代码已提交到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署前端"
   git push
   ```

2. **确认 `.env.production` 文件存在**
   - 文件已存在，配置了生产环境的 API 地址
   - 内容：`VITE_API_BASE_URL=https://image-puzzle-server.vercel.app/api`

### 步骤 2: 在 Vercel 创建项目

1. **登录 Vercel**
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 **Add New Project** 或 **New Project**
   - 选择你的前端代码仓库（vue-project）

3. **配置项目**
   - **Framework Preset**: 选择 **Vite**（Vercel 会自动检测）
   - **Root Directory**: 留空（使用根目录）
   - **Build Command**: `npm run build`（Vercel 会自动填充）
   - **Output Directory**: `dist`（Vercel 会自动填充）
   - **Install Command**: `npm install`（Vercel 会自动填充）

4. **环境变量配置**
   - 点击 **Environment Variables**
   - 添加环境变量：
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://image-puzzle-server.vercel.app/api`
     - **Environment**: 选择 **Production**（或 All）

5. **部署**
   - 点击 **Deploy**
   - 等待部署完成（通常 1-2 分钟）

### 步骤 3: 获取访问链接

部署完成后，你会得到：
- **生产环境链接**: `https://your-project-name.vercel.app`
- **预览链接**: 每次推送代码后会有新的预览链接

---

## 🔧 其他部署选项

### 选项 1: Netlify

1. 访问 https://www.netlify.com
2. 使用 GitHub 登录
3. 选择仓库并部署
4. 配置环境变量：`VITE_API_BASE_URL`

### 选项 2: GitHub Pages

1. 构建项目：`npm run build`
2. 将 `dist` 目录推送到 `gh-pages` 分支
3. 在 GitHub 仓库设置中启用 Pages

### 选项 3: 其他云服务

- **Cloudflare Pages**: 免费，速度快
- **AWS Amplify**: 功能强大
- **Firebase Hosting**: Google 的服务

---

## ✅ 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 登录功能正常
- [ ] API 请求正常（检查 Network 标签）
- [ ] 路由跳转正常（刷新页面不会 404）
- [ ] 环境变量正确配置

---

## 🐛 常见问题

### 问题 1: 刷新页面后 404
**解决方案**: `vercel.json` 中的 `rewrites` 配置已解决此问题

### 问题 2: API 请求失败
**解决方案**: 
- 检查环境变量 `VITE_API_BASE_URL` 是否正确
- 检查后端 CORS 配置是否允许前端域名

### 问题 3: 静态资源加载失败
**解决方案**: 
- 检查 `vite.config.ts` 中的 `base` 配置
- 确保资源路径正确

---

## 📝 注意事项

1. **环境变量**:
   - `.env.production` 文件不会自动上传到 Vercel
   - 需要在 Vercel 项目设置中手动添加环境变量

2. **CORS 配置**:
   - 后端需要允许前端域名访问
   - 在 Vercel 后端项目设置中添加 `ALLOWED_ORIGINS` 环境变量
   - 值：`https://your-frontend-domain.vercel.app`

3. **自动部署**:
   - 每次推送到 GitHub 主分支，Vercel 会自动重新部署
   - 预览分支的推送会创建预览部署

---

## 🎉 完成！

部署完成后，你就可以：
- ✅ 分享链接给别人访问
- ✅ 使用自定义域名（可选）
- ✅ 享受自动部署的便利

