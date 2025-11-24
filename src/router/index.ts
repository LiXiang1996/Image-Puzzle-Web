/**
 * 路由配置
 * 定义应用的所有路由规则和路由守卫
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由配置列表
 * - 根路径重定向到登录页
 * - 登录/注册页面不需要认证
 * - 首页和个人中心需要登录认证
 */
const routes: RouteRecordRaw[] = [
  // 根路径重定向到登录页
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
    },
  },
  // 首页路由 - 使用 MainLayout 布局，包含创作中心
  {
    path: '/home',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true, // 需要登录才能访问
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页',
          requiresAuth: true,
        },
      },
      {
        path: 'membership',
        name: 'Membership',
        component: () => import('@/views/Membership.vue'),
        meta: {
          title: '会员购买',
          requiresAuth: true,
        },
      },
    ],
  },
  // 个人中心路由 - 使用 UserLayout 布局，包含侧边栏导航
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: {
      requiresAuth: true, // 需要登录才能访问
    },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true,
        },
      },
      {
        path: 'consumption',
        name: 'UserConsumption',
        component: () => import('@/views/user/Consumption.vue'),
        meta: {
          title: '消费历史',
          requiresAuth: true,
        },
      },
      {
        path: 'works',
        name: 'UserWorks',
        component: () => import('@/views/user/Works.vue'),
        meta: {
          title: '我的作品',
          requiresAuth: true,
        },
      },
    ],
  },
  // 404 页面 - 匹配所有未定义的路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

/**
 * 创建路由实例
 * 使用 HTML5 History 模式
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * 全局路由守卫
 * 在每次路由跳转前执行，用于：
 * 1. 设置页面标题
 * 2. 处理已登录用户访问登录页的情况
 * 3. 检查需要认证的路由，未登录则跳转到登录页
 */
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '图片积木'}`
  }

  // 如果已登录，访问登录页时自动跳转到首页（避免重复登录）
  if (to.path === '/login' && userStore.isAuthenticated) {
    next('/home')
    return
  }

  // 检查路由是否需要登录认证
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // 未登录时跳转到登录页，并保存目标路由以便登录后跳转
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router

