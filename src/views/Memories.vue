<template>
  <div class="memories-container">
    <!-- 瀑布流布局 -->
    <div class="memories-grid" v-loading="loading">
      <!-- 第一个位置：添加图片 -->
      <div class="memory-item add-item" @click="handleOpenUpload">
        <div class="add-content">
          <el-icon class="add-icon"><Plus /></el-icon>
          <span class="add-text">添加回忆</span>
        </div>
      </div>

      <!-- 回忆瞬间列表 -->
      <div
        v-for="memory in memories"
        :key="memory.id"
        class="memory-item"
      >
        <!-- 图片 -->
        <div class="memory-image-wrapper">
          <img
            :src="memory.image_url"
            :alt="memory.description || '回忆瞬间'"
            class="memory-image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <!-- 点赞按钮（在图片右下角） -->
          <div
            class="like-button"
            v-if="userStore.isAuthenticated"
            @click.stop="handleLike(memory)"
            :class="{ liked: memory.is_liked }"
          >
            <el-icon class="like-icon">
              <Goods />
            </el-icon>
            <span class="like-count">{{ memory.like_count }}</span>
          </div>
        </div>

        <!-- 用户信息和描述（图片外） -->
        <div class="memory-info">
          <div class="memory-author">
            <img
              :src="memory.author.avatar || defaultAvatar"
              :alt="memory.author.nickname"
              class="author-avatar"
              @error="handleAvatarError"
            />
            <span class="author-name">{{ memory.author.nickname }}</span>
          </div>
          <p class="memory-description" v-if="memory.description">
            {{ memory.description }}
          </p>
          <span class="memory-time">{{ formatTime(memory.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 40, 60]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 上传弹窗 -->
    <MemoryUploadDialog
      v-model="showUploadDialog"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMemoryMoments, toggleMemoryLike } from '@/api/memory'
import type { MemoryMomentItem } from '@/types/memory'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Plus, Goods } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'
import MemoryUploadDialog from '@/components/MemoryUploadDialog.vue'

const userStore = useUserStore()

const memories = ref<MemoryMomentItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showUploadDialog = ref(false)

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('MM-DD HH:mm')
}

/**
 * 头像加载错误处理
 */
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = defaultAvatar
}

/**
 * 图片加载错误处理
 */
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E图片加载失败%3C/text%3E%3C/svg%3E'
}

/**
 * 图片加载完成处理（用于瀑布流布局）
 */
const handleImageLoad = (e: Event) => {
  // 图片加载完成后，可以触发瀑布流重新布局
  // 这里暂时不需要特殊处理，CSS会处理布局
}

/**
 * 打开上传弹窗
 */
const handleOpenUpload = () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  showUploadDialog.value = true
}

/**
 * 上传成功处理
 */
const handleUploadSuccess = () => {
  // 重新加载列表
  fetchMemories()
}

/**
 * 点赞处理
 */
const handleLike = async (memory: MemoryMomentItem) => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const data = await toggleMemoryLike(memory.id)
    // 更新本地状态
    memory.is_liked = data.is_liked
    memory.like_count = data.like_count
  } catch (error: any) {
    console.error('点赞失败:', error)
    ElMessage.error(error.response?.data?.detail || '操作失败，请重试')
  }
}

/**
 * 加载回忆瞬间列表
 */
const fetchMemories = async () => {
  loading.value = true
  try {
    const response = await getMemoryMoments({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    if (response) {
      memories.value = response.list || []
      total.value = response.total || 0
    }
  } catch (error) {
    console.error('加载回忆瞬间失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchMemories()
}

/**
 * 页码改变
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchMemories()
}

onMounted(() => {
  fetchMemories()
})
</script>

<style scoped>
.memories-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.memories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
  align-items: start; /* 确保项目从顶部对齐 */
}

.memory-item {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: all 0.3s;
  cursor: pointer;
}

.memory-item:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.add-item {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.add-item:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-tertiary);
}

.add-icon {
  font-size: 48px;
}

.add-text {
  font-size: var(--font-size-base);
  font-weight: 500;
}

.memory-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.memory-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain; /* 保持原始宽高比，不裁剪 */
}

.like-button {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
}

.like-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.like-button.liked {
  background-color: rgba(229, 115, 115, 0.8);
}

.like-button.liked:hover {
  background-color: rgba(229, 115, 115, 1);
}

.like-icon {
  font-size: 16px;
}

.like-count {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.memory-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.memory-author {
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
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.memory-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  word-break: break-word;
}

.memory-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
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

