# Vue Project

一个基于 Vue 3 + TypeScript 的现代化 Web 应用项目。

## 功能特性

- ✅ 用户登录/注册
- ✅ 个人资料管理
- ✅ 消费历史记录
- ✅ 作品管理
- ✅ 文生图创作中心

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 新一代状态管理库
- **Element Plus** - 基于 Vue 3 的组件库
- **Axios** - HTTP 客户端
- **Day.js** - 轻量级日期处理库

## 项目结构

```
vue-project/
├── src/
│   ├── api/              # API 接口
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── works.ts      # 作品相关接口
│   │   ├── consumption.ts # 消费相关接口
│   │   └── request.ts    # Axios 封装
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── layouts/          # 布局组件
│   │   └── UserLayout.vue
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # Pinia 状态管理
│   │   ├── user.ts       # 用户状态
│   │   ├── works.ts      # 作品状态
│   │   └── consumption.ts # 消费状态
│   ├── styles/           # 全局样式
│   │   └── index.css
│   ├── types/            # TypeScript 类型定义
│   │   ├── user.ts
│   │   ├── work.ts
│   │   └── consumption.ts
│   ├── utils/            # 工具函数
│   │   └── index.ts
│   ├── views/            # 页面组件
│   │   ├── auth/         # 认证页面
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── user/         # 用户相关页面
│   │   │   ├── Profile.vue
│   │   │   ├── Consumption.vue
│   │   │   ├── Works.vue
│   │   │   └── Create.vue
│   │   ├── Home.vue
│   │   └── NotFound.vue
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境变量

创建 `.env.development` 和 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=家书
```

## 路由说明

- `/` - 首页
- `/login` - 登录页
- `/register` - 注册页
- `/user/profile` - 个人资料
- `/user/consumption` - 消费历史
- `/user/works` - 我的作品
- `/user/create` - 创作中心

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 kebab-case（工具函数）

## License

MIT

