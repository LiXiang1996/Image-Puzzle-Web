/**
 * Markdown工具函数
 */
import { marked } from 'marked'

/**
 * 渲染Markdown为HTML
 */
export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return ''
  return marked(markdown)
}

/**
 * 提取纯文本预览（去除Markdown标记）
 */
export const getPreview = (markdown: string, length = 50): string => {
  if (!markdown) return ''
  // 移除Markdown标记
  const text = markdown
    .replace(/[#*`_\[\]()]/g, '') // 移除特殊字符
    .replace(/\n/g, ' ') // 换行符替换为空格
    .trim()
  return text.substring(0, length) + (text.length > length ? '...' : '')
}

