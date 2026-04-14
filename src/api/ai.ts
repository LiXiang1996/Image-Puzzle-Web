import request from './request'

export interface EditorAiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface EditorAiChatRequest {
  title: string
  content: string
  user_prompt: string
  history?: EditorAiMessage[]
}

export interface EditorAiChatResponse {
  reply: string
}

const useMockAi = import.meta.env.VITE_ENABLE_AI_MOCK === 'true'

export const chatWithEditorAssistant = async (
  payload: EditorAiChatRequest,
): Promise<EditorAiChatResponse> => {
  if (useMockAi) {
    return mockEditorAssistant(payload)
  }

  return request.post<EditorAiChatResponse>('/ai/editor-chat', payload)
}

async function mockEditorAssistant(
  payload: EditorAiChatRequest,
): Promise<EditorAiChatResponse> {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const trimmedTitle = payload.title.trim() || '未命名笔记'
  const plainContent = stripHtml(payload.content).trim()
  const excerpt = plainContent.slice(0, 160)

  const sections = [
    `已读取《${trimmedTitle}》当前内容。`,
    `你的要求是：${payload.user_prompt.trim()}`,
  ]

  if (excerpt) {
    sections.push(`结合当前正文，建议你先聚焦这段核心信息：${excerpt}${plainContent.length > 160 ? '…' : ''}`)
  } else {
    sections.push('当前正文还比较空，可以先给出事件、情绪或时间线，我再帮你扩写。')
  }

  sections.push('如果你愿意，我下一步可以继续帮你润色、续写、提炼标题，或者把语气改得更日常。')

  return {
    reply: sections.join('\n\n'),
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
}
