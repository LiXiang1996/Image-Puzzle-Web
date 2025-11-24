/**
 * 应用入口文件
 * 初始化 Vue 应用，配置插件和全局设置
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import './styles/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册 Element Plus 的所有图标组件
// 这样可以在模板中直接使用图标，如 <el-icon><User /></el-icon>
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 初始化用户信息（从本地存储恢复登录状态）
// 必须在路由配置之前执行，确保路由守卫能正确判断登录状态
const userStore = useUserStore()
userStore.initUserInfo()

// 配置路由
app.use(router)

// 配置 Element Plus UI 组件库
app.use(ElementPlus, {
  locale: zhCn, // 使用中文语言包
})

// 挂载应用到 DOM
app.mount('#app')

