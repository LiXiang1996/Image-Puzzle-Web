import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 浏览器标签页标题片段（与 VITE_APP_TITLE 拼接） */
    title?: string
    /** meta description，用于搜索摘要与 OG */
    description?: string
    /** robots 指令，如 index, follow 或 noindex, nofollow */
    robots?: string
    requiresAuth?: boolean
  }
}

export {}
