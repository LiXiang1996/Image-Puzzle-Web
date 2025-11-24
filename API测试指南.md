# API接口测试指南

## 🔍 如何查看接口请求

### 方法一：浏览器开发者工具（推荐）

1. **打开浏览器开发者工具**
   - Chrome/Edge: 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

2. **切换到 Network（网络）标签**
   - 点击顶部菜单栏的 "Network" 标签

3. **确保记录已开启**
   - 确保 Network 标签左上角的红色圆点是**红色**（表示正在记录）
   - 如果是灰色，点击一下变成红色

4. **清除之前的记录（可选）**
   - 点击 🚫 图标清除之前的网络请求记录

5. **执行操作触发请求**
   - 在页面上进行登录、注册等操作
   - 网络请求会自动显示在 Network 标签中

6. **查看请求详情**
   - 点击任意一个请求，可以看到：
     - **Headers（请求头）**: 查看请求URL、方法、请求头等
     - **Payload（请求体）**: 查看发送的数据
     - **Response（响应）**: 查看服务器返回的数据
     - **Preview（预览）**: 格式化显示响应数据

### 方法二：后端终端日志

后端服务启动后，每次有请求都会在终端显示日志，包括：
- 请求方法（GET/POST等）
- 请求路径
- 请求参数
- 响应状态码

### 方法三：FastAPI 自动文档

访问 http://localhost:8080/docs 可以在线测试所有API接口。

---

## 🧪 测试步骤

### 第一步：确保服务已启动

**检查后端服务：**
```bash
# 后端终端应该显示类似：
INFO:     Uvicorn running on http://0.0.0.0:8080
```

**检查前端服务：**
```bash
# 前端终端应该显示类似：
➜  Local:   http://localhost:3000/
```

### 第二步：打开浏览器开发者工具

1. 打开 http://localhost:3000
2. 按 `F12` 打开开发者工具
3. 切换到 **Network（网络）** 标签
4. 确保记录已开启（红色圆点）

### 第三步：测试注册接口

1. **操作：** 访问注册页面，填写表单并点击"注册"
2. **预期请求：**
   - 请求URL: `http://localhost:3000/api/auth/register`
   - 请求方法: `POST`
   - 请求体: `{"username": "...", "password": "...", "email": "..."}`
3. **查看方式：**
   - 在 Network 标签中找到 `register` 请求
   - 点击查看详情，检查：
     - Request Payload（发送的数据）
     - Response（服务器返回的数据）

### 第四步：测试登录接口

1. **操作：** 在登录页面填写用户名和密码，点击"登录"
2. **预期请求：**
   - 请求URL: `http://localhost:3000/api/auth/login`
   - 请求方法: `POST`
   - 请求体: `{"username": "...", "password": "..."}`
3. **查看方式：**
   - 在 Network 标签中找到 `login` 请求
   - 检查 Response 中是否包含 `token` 和 `userInfo`

### 第五步：测试需要认证的接口

登录成功后，测试需要token的接口（如获取作品列表）：

1. **操作：** 访问作品列表页面
2. **预期请求：**
   - 请求URL: `http://localhost:3000/api/works`
   - 请求方法: `GET`
   - 请求头: 应该包含 `Authorization: Bearer <token>`
3. **查看方式：**
   - 在 Network 标签中找到 `works` 请求
   - 点击 Headers 标签，查看 Request Headers
   - 确认 Authorization 头存在且包含token

---

## 🐛 常见问题排查

### 问题1：Network 标签中没有看到请求

**可能原因：**
1. Network 记录未开启（圆点是灰色）
2. 页面刷新了，请求被清空
3. 请求被浏览器缓存了

**解决方法：**
- 确保红色圆点是**红色**
- 勾选 "Preserve log"（保留日志）选项
- 勾选 "Disable cache"（禁用缓存）选项
- 刷新页面后重新操作

### 问题2：请求显示为红色（失败）

**可能原因：**
1. 后端服务未启动
2. CORS 跨域问题
3. 网络连接问题

**解决方法：**
- 检查后端服务是否正常运行
- 检查后端终端是否有错误信息
- 点击失败的请求查看错误详情

### 问题3：请求状态码为 404

**可能原因：**
1. 后端路由路径不匹配
2. 代理配置错误

**解决方法：**
- 检查请求URL是否正确
- 检查 `vite.config.ts` 中的代理配置
- 检查后端 `main.py` 中的路由定义

### 问题4：请求状态码为 401（未授权）

**可能原因：**
1. Token 未正确发送
2. Token 已过期
3. Token 格式错误

**解决方法：**
- 检查 Request Headers 中是否有 `Authorization` 头
- 检查 token 格式是否为 `Bearer <token>`
- 重新登录获取新token

### 问题5：请求状态码为 500（服务器错误）

**可能原因：**
1. 后端代码有bug
2. 数据库连接问题
3. 数据格式不匹配

**解决方法：**
- 查看后端终端错误日志
- 检查请求发送的数据格式
- 检查后端代码逻辑

---

## 📊 请求示例

### 注册请求示例

**Request:**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com"
}
```

**Response (成功):**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user_id": 1
  }
}
```

### 登录请求示例

**Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

**Response (成功):**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "1",
      "username": "testuser",
      "email": "test@example.com",
      "avatar": null
    }
  }
}
```

### 获取作品列表请求示例

**Request:**
```
GET http://localhost:3000/api/works?page=1&pageSize=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (成功):**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "1",
      "title": "我的作品",
      "imageUrl": "https://...",
      "status": "completed",
      ...
    }
  ]
}
```

---

## ✅ 验证清单

完成以下检查，确保API连接正常：

- [ ] 后端服务正常运行（端口8080）
- [ ] 前端服务正常运行（端口3000）
- [ ] 浏览器开发者工具 Network 标签已打开
- [ ] 注册接口可以正常调用并看到请求
- [ ] 登录接口可以正常调用并返回token
- [ ] 登录后请求包含 Authorization 头
- [ ] 作品列表接口可以正常调用
- [ ] 所有请求的响应格式正确

---

## 💡 调试技巧

1. **使用过滤器**
   - 在 Network 标签的过滤框中输入 `api`，只显示API请求
   - 输入 `XHR` 或 `Fetch`，只显示AJAX请求

2. **查看请求时间**
   - 关注请求的耗时，如果很慢可能是网络或服务器问题

3. **复制请求为cURL**
   - 右键点击请求 → Copy → Copy as cURL
   - 可以在终端中直接测试请求

4. **查看响应预览**
   - 点击请求 → Preview 标签
   - 可以格式化查看JSON响应

5. **检查控制台错误**
   - 切换到 Console 标签查看JavaScript错误
   - 这些错误可能影响API调用

