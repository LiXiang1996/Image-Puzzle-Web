/**
 * 站内 SEO：动态更新 description、canonical、Open Graph / Twitter 与 robots
 * 适用于 SPA（需爬虫执行 JS；社交预览若需静态 HTML 需 SSR 或预渲染）
 */

const SITE_ORIGIN =
  (import.meta.env.VITE_SITE_ORIGIN as string | undefined)?.replace(/\/$/, '') ||
  'https://image-puzzle-web-skmv.vercel.app'

export const DEFAULT_META_DESCRIPTION =
  '家书是在线记事本与图片分享平台，支持图文编辑、图片上传与公开分享。在发现广场浏览公开笔记，在回忆瞬间分享生活影像，记录琐事与温暖瞬间。'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLinkCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * 根据当前路由应用 SEO（不含 document.title，标题由路由守卫设置）
 */
export function applyRouteSeo(options: {
  description: string
  canonicalPath: string
  robots?: string
}) {
  const path = options.canonicalPath.startsWith('/')
    ? options.canonicalPath
    : `/${options.canonicalPath}`
  const canonical = `${SITE_ORIGIN}${path}`

  upsertMeta('name', 'description', options.description)
  upsertLinkCanonical(canonical)

  const robots = options.robots ?? 'index, follow'
  upsertMeta('name', 'robots', robots)

  const title = document.title
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', options.description)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', options.description.slice(0, 200))
}

/** 从笔记生成摘要描述（供搜索引擎展示） */
export function buildNoteMetaDescription(note: { title: string; content?: string }): string {
  const raw = (note.content ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*`_[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const excerpt = raw.slice(0, 120)
  const tail = raw.length > 120 ? '…' : ''
  return `${note.title}｜${excerpt}${tail}｜家书 · 图文笔记分享`
}
