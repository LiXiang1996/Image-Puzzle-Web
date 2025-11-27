<template>
  <div class="note-detail-container">
    <div class="detail-wrapper" v-loading="loading">
      <div v-if="note" class="note-content">
        <!-- 标题 -->
        <h1 class="note-title">{{ note.title }}</h1>

        <!-- 作者信息和发布时间 -->
        <div class="note-meta">
          <div class="author-info">
            <img
              :src="authorAvatar"
              :alt="authorName"
              class="author-avatar"
              @error="handleAvatarError"
            />
            <span class="author-name">{{ authorName }}</span>
          </div>
          <span class="publish-time">{{ formatTime(note.published_at || note.created_at) }}</span>
        </div>

        <!-- 内容（Markdown渲染） -->
        <div class="note-body" v-html="renderedContent"></div>

        <!-- 操作按钮（如果是自己的文章） -->
        <div class="note-actions" v-if="isOwnNote">
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <el-empty description="笔记不存在或已被删除" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPublicNoteById } from '@/api/notes'
import { useUserStore } from '@/stores/user'
import type { NoteDetail } from '@/types/note'
import { renderMarkdown } from '@/utils/markdown'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const note = ref<NoteDetail | null>(null)
const loading = ref(false)
const authorAvatar = ref<string>('')
const authorName = ref<string>('')

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

/**
 * 渲染后的内容
 */
const renderedContent = computed(() => {
  if (!note.value?.content) return ''
  return renderMarkdown(note.value.content)
})

/**
 * 是否是自己的文章
 */
const isOwnNote = computed(() => {
  return userStore.userInfo && note.value && userStore.userInfo.id === note.value.user_id
})

/**
 * 头像加载错误处理
 */
const handleAvatarError = () => {
  authorAvatar.value = defaultAvatar
}

/**
 * 编辑笔记
 */
const handleEdit = () => {
  if (note.value) {
    router.push(`/edit/${note.value.id}`)
  }
}

/**
 * 加载笔记详情
 */
const loadNote = async () => {
  const noteId = route.params.id as string
  if (!noteId) {
    router.push('/home')
    return
  }

  loading.value = true
  try {
    const response = await getPublicNoteById(noteId)
    if (response.data) {
      note.value = response.data
      // 这里需要获取作者信息，暂时使用占位符
      // TODO: 从API获取作者信息
      authorName.value = '作者'
      authorAvatar.value = defaultAvatar
    }
  } catch (error) {
    console.error('加载笔记详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.note-detail-container {
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
}

.detail-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
}

.note-title {
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg);
  line-height: var(--line-height-tight);
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
}

.author-name {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.publish-time {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.note-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

:deep(.note-body h1),
:deep(.note-body h2),
:deep(.note-body h3) {
  margin: var(--spacing-lg) 0 var(--spacing-md);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.note-body p) {
  margin: var(--spacing-md) 0;
}

:deep(.note-body img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
}

:deep(.note-body a) {
  color: var(--link-color);
  text-decoration: underline;
}

:deep(.note-body code) {
  background-color: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-family-code);
}

:deep(.note-body pre) {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--spacing-md) 0;
}

:deep(.note-body blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--text-secondary);
  font-style: italic;
}

.note-actions {
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}
</style>

