<template>
  <div class="create-container">
    <!-- 对话历史区域 -->
    <div class="conversation-area" ref="conversationAreaRef">
      <div v-if="conversations.length === 0" class="empty-state">
        <el-empty description="开始你的创作之旅，输入提示词生成图片吧" />
      </div>
      <div v-else class="conversation-list">
        <div
          v-for="(conversation, index) in conversations"
          :key="index"
          class="conversation-item"
        >
          <!-- 用户输入 -->
          <div class="user-message">
            <div class="message-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-label">你的想法</span>
                <span class="message-time">{{ formatTime(conversation.timestamp) }}</span>
              </div>
              <div class="message-text">
                <p v-if="conversation.prompt">{{ conversation.prompt }}</p>
                <div v-if="conversation.image" class="message-image">
                  <el-image
                    :src="conversation.image"
                    :preview-src-list="[conversation.image]"
                    fit="cover"
                    style="width: 200px; height: 200px; border-radius: 8px"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- AI 生成结果 -->
          <div class="ai-message">
            <div class="message-avatar ai-avatar">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-label">生成结果</span>
                <span v-if="conversation.status === 'generating'" class="generating-status">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  生成中...
                </span>
                <span v-else-if="conversation.status === 'completed'" class="completed-status">
                  已完成
                </span>
                <span v-else-if="conversation.status === 'failed'" class="failed-status">
                  生成失败
                </span>
              </div>
              <div class="message-text">
                <div v-if="conversation.status === 'generating'" class="generating-placeholder">
                  <el-skeleton :rows="2" animated />
                </div>
                <div v-else-if="conversation.status === 'completed' && conversation.result" class="result-images">
                  <el-image
                    v-for="(img, imgIndex) in conversation.result"
                    :key="imgIndex"
                    :src="img.url"
                    :preview-src-list="conversation.result.map((r: any) => r.url)"
                    fit="cover"
                    class="result-image"
                    :lazy="true"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <span>加载失败</span>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div v-else-if="conversation.status === 'failed'" class="error-message">
                  <el-alert
                    :title="conversation.error || '生成失败，请重试'"
                    type="error"
                    :closable="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域（固定在底部） -->
    <div class="input-area">
      <el-card shadow="never" class="input-card">
        <div class="input-container">
          <!-- 图片上传区域 -->
          <div class="image-upload-section">
            <el-upload
              v-model:file-list="uploadedImages"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-preview="handleImagePreview"
              :on-remove="handleImageRemove"
              :before-upload="beforeImageUpload"
              :limit="3"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">可上传参考图片（最多3张，可选）</div>
          </div>

          <!-- 文本输入区域 -->
          <div class="text-input-section">
            <el-input
              v-model="currentPrompt"
              type="textarea"
              :rows="3"
              placeholder="说说今天想做点什么...描述你想要的图片内容"
              :maxlength="500"
              show-word-limit
              @keydown.ctrl.enter="handleGenerate"
              @keydown.meta.enter="handleGenerate"
            />
          </div>

          <!-- 操作按钮区域 -->
          <div class="action-section">
            <div class="action-left">
              <el-button-group>
                <el-button :type="mode === 'text' ? 'primary' : ''" @click="mode = 'text'">
                  文生图
                </el-button>
                <el-button :type="mode === 'image' ? 'primary' : ''" @click="mode = 'image'">
                  图生图
                </el-button>
              </el-button-group>
              <el-select v-model="selectedSize" style="width: 120px; margin-left: 12px">
                <el-option label="512x512" value="512x512" />
                <el-option label="768x768" value="768x768" />
                <el-option label="1024x1024" value="1024x1024" />
              </el-select>
            </div>
            <div class="action-right">
              <el-button @click="handleClear">清空</el-button>
              <el-button
                type="primary"
                @click="handleGenerate"
                :loading="isGenerating"
                :disabled="!canGenerate"
                size="large"
              >
                <el-icon v-if="!isGenerating"><Promotion /></el-icon>
                生成
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 创作中心组件
 * 参考即梦生成中心的对话式界面设计
 * 功能：
 * 1. 对话式界面展示生成历史
 * 2. 支持文生图和图生图两种模式
 * 3. 支持上传参考图片
 * 4. 实时显示生成状态
 */
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Picture,
  Plus,
  Loading,
  Promotion,
} from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import dayjs from 'dayjs'

/**
 * 对话项接口定义
 * 记录每次用户输入和 AI 生成的结果
 */
interface Conversation {
  id: string // 对话唯一标识
  prompt: string // 用户输入的提示词
  image?: string // 参考图片 URL（图生图模式）
  result?: Array<{ url: string; id: string }> // 生成的结果图片列表
  status: 'generating' | 'completed' | 'failed' // 生成状态
  error?: string // 错误信息（如果生成失败）
  timestamp: number // 时间戳
}

// 对话历史列表
const conversations = ref<Conversation[]>([])
// 当前输入的提示词
const currentPrompt = ref('')
// 上传的参考图片列表
const uploadedImages = ref<UploadFiles>([])
// 生成模式：文生图 或 图生图
const mode = ref<'text' | 'image'>('text')
// 选择的图片尺寸
const selectedSize = ref('512x512')
// 是否正在生成中
const isGenerating = ref(false)
// 对话区域的 DOM 引用，用于自动滚动
const conversationAreaRef = ref<HTMLElement>()

/**
 * 计算属性：判断是否可以生成
 * 文生图模式：只需要有提示词
 * 图生图模式：需要提示词和参考图片
 */
const canGenerate = computed(() => {
  if (mode.value === 'text') {
    return currentPrompt.value.trim().length > 0
  } else {
    return currentPrompt.value.trim().length > 0 && uploadedImages.value.length > 0
  }
})

/**
 * 格式化时间戳
 * 将时间戳格式化为 HH:mm:ss 格式
 */
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

/**
 * 图片上传前的验证
 * 检查文件类型和大小
 */
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }
  return true
}

/**
 * 图片预览处理
 */
const handleImagePreview = (file: UploadFile) => {
  // 图片预览逻辑
  console.log('Preview image:', file)
}

/**
 * 图片移除处理
 */
const handleImageRemove = () => {
  // 图片移除逻辑
}

/**
 * 生成图片
 * 核心功能：根据用户输入的提示词和参考图片生成新图片
 */
const handleGenerate = async () => {
  if (!canGenerate.value || isGenerating.value) return

  const prompt = currentPrompt.value.trim()
  if (!prompt) {
    ElMessage.warning('请输入提示词')
    return
  }

  if (mode.value === 'image' && uploadedImages.value.length === 0) {
    ElMessage.warning('图生图模式需要上传参考图片')
    return
  }

  isGenerating.value = true

  // 创建新的对话项，初始状态为生成中
  const conversationId = `conv_${Date.now()}`
  const conversation: Conversation = {
    id: conversationId,
    prompt,
    // 如果有上传图片，创建本地 URL 用于预览
    image: uploadedImages.value.length > 0 ? URL.createObjectURL(uploadedImages.value[0].raw!) : undefined,
    status: 'generating',
    timestamp: Date.now(),
  }

  conversations.value.push(conversation)

  // 等待 DOM 更新后滚动到底部，确保新对话可见
  await nextTick()
  scrollToBottom()

  try {
    // TODO: 调用真实的图片生成 API
    // 当前使用模拟数据，实际应该调用后端 API
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟生成结果（使用随机图片服务）
    const mockResult = [
      {
        url: `https://picsum.photos/seed/${conversationId}/512/512`,
        id: `img_${Date.now()}_1`,
      },
    ]

    // 更新对话状态为已完成，并保存生成结果
    conversation.status = 'completed'
    conversation.result = mockResult

    ElMessage.success('生成成功！')
  } catch (error) {
    // 生成失败，更新状态和错误信息
    conversation.status = 'failed'
    conversation.error = error instanceof Error ? error.message : '生成失败'
    ElMessage.error('生成失败，请重试')
  } finally {
    isGenerating.value = false
    // 清空输入，准备下一次生成
    currentPrompt.value = ''
    uploadedImages.value = []
  }
}

/**
 * 清空输入
 * 清空提示词和上传的图片
 */
const handleClear = () => {
  currentPrompt.value = ''
  uploadedImages.value = []
  ElMessage.info('已清空输入')
}

/**
 * 滚动到底部
 * 确保最新的对话内容可见
 */
const scrollToBottom = () => {
  if (conversationAreaRef.value) {
    conversationAreaRef.value.scrollTop = conversationAreaRef.value.scrollHeight
  }
}

/**
 * 组件挂载时执行
 * 可以在这里加载历史对话记录
 */
onMounted(() => {
  // TODO: 从 API 或本地存储加载历史对话
  // 例如：从后端获取用户的生成历史，或从 localStorage 恢复未完成的对话
})
</script>

<style scoped>
.create-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 1400px;
  margin: 0 auto;
}

/* 对话历史区域 */
.conversation-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fafafa;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.conversation-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 消息样式 */
.user-message,
.ai-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #67c23a;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-label {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.generating-status,
.completed-status,
.failed-status {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.completed-status {
  color: #67c23a;
}

.failed-status {
  color: #f56c6c;
}

.message-text {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-text p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-image {
  margin-top: 12px;
}

.result-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.result-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.result-image:hover {
  transform: scale(1.02);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.generating-placeholder {
  padding: 20px;
}

.error-message {
  margin-top: 8px;
}

/* 输入区域 */
.input-area {
  border-top: 1px solid #e4e7ed;
  background-color: white;
  padding: 16px;
}

.input-card {
  border: none;
}

.input-card :deep(.el-card__body) {
  padding: 0;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-upload-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.text-input-section {
  width: 100%;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  align-items: center;
}

.action-right {
  display: flex;
  gap: 12px;
}

/* 滚动条样式 */
.conversation-area::-webkit-scrollbar {
  width: 8px;
}

.conversation-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversation-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.conversation-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
