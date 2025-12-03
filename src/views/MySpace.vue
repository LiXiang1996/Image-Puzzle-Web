<template>
  <div class="myspace-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreateNote"
        class="create-button"
      >
        新建笔记
      </el-button>
      <div class="search-wrapper">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记标题..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearchClear"
        />
        <el-button
          type="primary"
          :icon="Search"
          @click="handleSearch"
          class="search-button"
        >
          搜索
        </el-button>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="notes-list" v-loading="notesStore.loading">
      <div v-if="notesStore.filteredNotes.length === 0" class="empty-state">
        <el-empty description="还没有笔记，创建第一篇吧~" />
      </div>

      <div
        v-for="note in notesStore.filteredNotes"
        :key="note.id"
        class="note-item"
        @click="handleNoteClick(note.id)"
      >
        <div class="note-header">
          <h3 class="note-title">{{ note.title }}</h3>
          <el-tag
            :type="getStatusTagType(note.status)"
            size="small"
            class="status-tag"
          >
            {{ getStatusText(note.status) }}
          </el-tag>
        </div>
        <div class="note-content-preview" v-if="note.content_preview">
          {{ note.content_preview }}
        </div>
        <div class="note-meta">
          <span class="note-time">{{ formatTime(note.updated_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="notesStore.total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="notesStore.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { Plus, Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const notesStore = useNotesStore()

// 搜索关键词
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

/**
 * 格式化时间：MM-DD HH:MM
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('MM-DD HH:mm')
}

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'private':
      return 'info'
    case 'public':
      return 'success'
    case 'draft':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'private':
      return '私密'
    case 'public':
      return '已发布'
    case 'draft':
      return '草稿'
    default:
      return '未知'
  }
}

/**
 * 创建新笔记
 */
const handleCreateNote = () => {
  router.push('/edit')
}

/**
 * 点击笔记项
 */
const handleNoteClick = (noteId: string) => {
  router.push(`/edit/${noteId}`)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  notesStore.setSearchKeyword(searchKeyword.value)
  currentPage.value = 1
  fetchNotes()
}

/**
 * 清除搜索
 */
const handleSearchClear = () => {
  searchKeyword.value = ''
  handleSearch()
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
 * 获取笔记列表
 */
const fetchNotes = async () => {
  await notesStore.fetchNotes({
    page: currentPage.value,
    page_size: pageSize.value,
    search: searchKeyword.value || undefined,
  })
}

// 监听搜索关键词变化
watch(
  () => notesStore.searchKeyword,
  (newVal) => {
    searchKeyword.value = newVal
  }
)

// 初始化
onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
.myspace-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: var(--spacing-xl);
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

.toolbar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  align-items: center;
}

.create-button {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.create-button:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.search-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  flex: 1;
  max-width: 500px;
}

.search-input {
  flex: 1;
}

.search-button {
  flex-shrink: 0;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-md);
}

.note-title {
  flex: 1;
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

.status-tag {
  flex-shrink: 0;
}

.note-content-preview {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.note-time {
  color: var(--text-tertiary);
}

.empty-state {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.pagination {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl) 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
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

