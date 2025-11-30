<template>
  <div class="favorites-container">
    <div class="favorites-header">
      <h2 class="favorites-title">我的收藏</h2>
      <p class="favorites-subtitle">共 {{ total }} 篇文章</p>
    </div>

    <div class="favorites-content" v-loading="loading">
      <div v-if="favorites.length > 0" class="favorites-list">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="favorite-item"
          @click="handleNoteClick(item.id)"
        >
          <h3 class="favorite-title">{{ item.title }}</h3>
          <p class="favorite-preview" v-if="item.content_preview">
            {{ item.content_preview }}
          </p>
          <div class="favorite-meta">
            <div class="favorite-author">
              <img
                :src="item.author.avatar || defaultAvatar"
                :alt="item.author.nickname"
                class="author-avatar-small"
                @error="handleAvatarError"
              />
              <span class="author-name">{{ item.author.nickname }}</span>
            </div>
            <span class="favorite-time">{{ formatTime(item.favorited_at) }}</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="还没有收藏任何文章" />

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserFavorites } from '@/api/interaction'
import type { FavoriteItem } from '@/types/interaction'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'

const router = useRouter()

const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

/**
 * 头像加载错误处理
 */
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = defaultAvatar
}

/**
 * 加载收藏列表
 */
const loadFavorites = async () => {
  loading.value = true
  try {
    const data = await getUserFavorites({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    favorites.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理笔记点击
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
  loadFavorites()
}

/**
 * 页码改变
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFavorites()
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-container {
  max-width: 900px;
  margin: 0 auto;
}

.favorites-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.favorites-title {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.favorites-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.favorites-content {
  min-height: 400px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.favorite-item {
  padding: var(--spacing-lg);
  background-color: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.favorite-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-h4);
  font-weight: 600;
  color: var(--text-primary);
}

.favorite-preview {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
}

.author-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.favorite-time {
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
</style>

