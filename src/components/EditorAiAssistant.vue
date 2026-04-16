<template>
  <div class="ai-assistant">
    <button
      class="ai-toggle"
      type="button"
      @click="togglePanel"
      :aria-expanded="panelVisible"
      aria-label="打开AI助手"
    >
      <span class="ai-toggle-mark">AI</span>
    </button>

    <transition name="ai-panel">
      <aside v-if="panelVisible" class="ai-panel">
        <div class="ai-panel-header">
          <div>
            <h3>AI 助手</h3>
            <p>结合当前笔记内容进行对话</p>
          </div>
          <button class="ai-close" type="button" @click="panelVisible = false">关闭</button>
        </div>

        <div class="ai-quick-actions">
          <button
            v-for="action in quickActions"
            :key="action"
            class="ai-quick-chip"
            type="button"
            @click="promptInput = action"
          >
            {{ action }}
          </button>
        </div>

        <div class="ai-messages">
          <div v-if="messages.length === 0" class="ai-empty">
            <p>先输入一句提示词，例如“帮我润色这段内容”或“给我三个标题”。</p>
          </div>

          <div
            v-for="(message, index) in messages"
            :key="`${message.role}-${index}`"
            class="ai-message"
            :class="`is-${message.role}`"
          >
            <div class="ai-message-meta">
              <span>{{ message.role === 'user' ? '我' : 'AI' }}</span>
            </div>
            <div class="ai-message-body">{{ message.content }}</div>
            <div v-if="message.role === 'assistant'" class="ai-message-actions">
              <button type="button" @click="copyMessage(message.content)">复制</button>
              <button type="button" @click="emit('insert-content', message.content)">插入正文</button>
            </div>
          </div>
        </div>

        <div class="ai-input-area">
          <el-input
            v-model="promptInput"
            type="textarea"
            :rows="4"
            resize="none"
            maxlength="1000"
            show-word-limit
            placeholder="输入你想让 AI 帮你做的事情"
            @keydown.ctrl.enter.prevent="sendMessage"
            @keydown.meta.enter.prevent="sendMessage"
          />
          <div class="ai-input-hint">
            <span>发送时会携带当前文章标题和正文</span>
            <button
              v-if="messages.length > 0"
              class="ai-clear"
              type="button"
              @click="clearConversation"
            >
              清空对话
            </button>
          </div>
          <el-button
            type="primary"
            :loading="sending"
            :disabled="!promptInput.trim()"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  chatWithEditorAssistant,
  type EditorAiMessage,
} from '@/api/ai'

const props = defineProps<{
  noteTitle: string
  noteContent: string
}>()

const emit = defineEmits<{
  'insert-content': [content: string]
}>()

const panelVisible = ref(false)
const sending = ref(false)
const promptInput = ref('')
const messages = ref<EditorAiMessage[]>([])

const quickActions = [
  '帮我润色当前内容',
  '帮我续写一段自然的结尾',
  '根据正文给我 3 个标题',
  '帮我提炼成一段摘要',
]

const togglePanel = () => {
  panelVisible.value = !panelVisible.value
}

const sendMessage = async () => {
  const prompt = promptInput.value.trim()
  if (!prompt || sending.value) return

  panelVisible.value = true
  sending.value = true

  const history = [...messages.value]
  messages.value.push({
    role: 'user',
    content: prompt,
  })

  try {
    const response = await chatWithEditorAssistant({
      title: props.noteTitle,
      content: props.noteContent,
      user_prompt: prompt,
      history,
    })

    messages.value.push({
      role: 'assistant',
      content: response.reply,
    })
    promptInput.value = ''
  } catch (error) {
    console.error('AI 对话失败:', error)
    const message = error instanceof Error ? error.message : 'AI 助手暂时不可用，请稍后再试'
    ElMessage.error(message)
    messages.value = history
  } finally {
    sending.value = false
  }
}

const clearConversation = () => {
  messages.value = []
  promptInput.value = ''
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动选择内容')
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  right: 24px;
  top: 50%;
  z-index: 1100;
  transform: translateY(-50%);
}

.ai-toggle {
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8a65, #ffb08a);
  box-shadow: 0 10px 24px rgba(255, 138, 101, 0.28);
  color: #fff;
  cursor: pointer;
}

.ai-toggle-mark {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.ai-panel {
  position: absolute;
  top: 50%;
  right: 72px;
  width: min(380px, calc(100vw - 112px));
  max-height: min(720px, 76vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: rgba(255, 251, 247, 0.98);
  box-shadow: 0 18px 42px rgba(62, 39, 35, 0.16);
  transform: translateY(-50%);
}

.ai-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border-light);
}

.ai-panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.ai-panel-header p {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.ai-close,
.ai-quick-chip,
.ai-message-actions button,
.ai-clear {
  border: none;
  background: transparent;
  cursor: pointer;
}

.ai-close {
  color: var(--text-secondary);
  font-size: 12px;
}

.ai-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px 0;
}

.ai-quick-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 12px;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
}

.ai-empty {
  padding: 18px;
  border-radius: 14px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.ai-message + .ai-message {
  margin-top: 14px;
}

.ai-message-meta {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.ai-message-body {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px 14px;
  border-radius: 14px;
  line-height: 1.7;
  font-size: 13px;
}

.ai-message.is-user .ai-message-body {
  background: #fff2e8;
  color: var(--text-primary);
}

.ai-message.is-assistant .ai-message-body {
  background: #fff;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.ai-message-actions {
  display: flex;
  gap: 14px;
  margin-top: 8px;
  padding-left: 4px;
}

.ai-message-actions button,
.ai-clear {
  color: var(--primary-color);
  font-size: 12px;
}

.ai-input-area {
  padding: 14px 18px 18px;
  border-top: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.72);
}

.ai-input-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.ai-panel-enter-active,
.ai-panel-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.ai-panel-enter-from,
.ai-panel-leave-to {
  opacity: 0;
  transform: translate(14px, -50%);
}

@media (max-width: 960px) {
  .ai-assistant {
    right: 16px;
    top: auto;
    bottom: 24px;
    transform: none;
  }

  .ai-panel {
    top: auto;
    right: 0;
    bottom: 68px;
    width: min(360px, calc(100vw - 32px));
    max-height: min(620px, 68vh);
    transform: none;
  }

  .ai-panel-enter-from,
  .ai-panel-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
