<template>
  <div class="discover-container">
    <!-- 公开文章列表 -->
    <div class="notes-list" v-loading="loading">
      <div v-if="notes.length === 0 && !loading" class="empty-state">
        <el-empty description="还没有公开文章，快去发布第一篇吧~" />
      </div>

      <div
        v-for="note in notes"
        :key="note.id"
        class="note-item"
        @click="handleNoteClick(note.id)"
      >
        <div class="note-header">
          <h3 class="note-title">{{ note.title }}</h3>
        </div>
        <div class="note-content-preview" v-if="note.content_preview">
          {{ note.content_preview }}
        </div>
        <div class="note-footer">
          <div class="author-info">
            <img
              :src="note.author.avatar || defaultAvatar"
              :alt="note.author.nickname"
              class="author-avatar"
              @error="handleAvatarError"
            />
            <span class="author-name">{{ note.author.nickname }}</span>
          </div>
          <span class="publish-time">{{ formatTime(note.published_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDiscoverNotes } from '@/api/notes'
import type { PublicNoteItem } from '@/types/note'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'

const router = useRouter()

// 状态
const notes = ref<PublicNoteItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

/**
 * 格式化时间：MM-DD HH:MM
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('MM-DD HH:mm')
}

/**
 * 头像加载错误处理
 */
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

/**
 * 点击笔记项
 */
const handleNoteClick = (noteId: string) => {
  router.push(`/note/${noteId}`)
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchNotes()
}

/**
 * 页码改变
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchNotes()
}

/**
 * 获取发现广场列表
 */
const fetchNotes = async () => {
  loading.value = true
  try {
    const response = await getDiscoverNotes({
      page: currentPage.value,
      page_size: pageSize.value,
    })

    if (response) {
      notes.value = response.list
      total.value = response.total
    }
  } catch (error) {
    console.error('获取发现广场列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
.discover-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.note-item {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--card-shadow);
  border: 1px solid transparent;
}

.note-item:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
  border-color: var(--border-color);
}

.note-header {
  margin-bottom: var(--spacing-sm);
}

.note-title {
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: 600;
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-content-preview {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
}

.author-name {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.publish-time {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.empty-state {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.pagination {
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: var(--bg-card);
  --el-pagination-text-color: var(--text-primary);
  --el-pagination-border-radius: var(--radius-md);
}

:deep(.el-pagination .btn-next),
:deep(.el-pagination .btn-prev) {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

:deep(.el-pagination .number) {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

:deep(.el-pagination .number.is-active) {
  background-color: var(--primary-color);
  color: white;
}
</style>

