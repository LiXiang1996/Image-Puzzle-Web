/// <reference types="vite/client" />

/**
 * Vue 组件类型声明
 * 告诉 TypeScript 如何处理 .vue 文件的导入
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  /** 站点绝对源（canonical / og:url），如 https://example.com */
  readonly VITE_SITE_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

