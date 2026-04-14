<template>
  <div class="user-profile-container">
    <div class="profile-wrapper" v-loading="loading">
      <!-- 用户信息卡片 -->
      <div class="user-card" v-if="userInfo">
        <img
          :src="userAvatar"
          :alt="userInfo.nickname || userInfo.username"
          class="user-avatar-large"
          @error="handleAvatarError"
        />
        <h1 class="user-name">{{ userInfo.nickname || userInfo.username }}</h1>
        <p class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</p>
      </div>

      <!-- 文章列表 -->
      <div class="notes-section">
        <h2 class="section-title">公开文章</h2>
        <div class="notes-list" v-if="notes.length > 0">
          <div
            v-for="note in notes"
            :key="note.id"
            class="note-item"
            @click="handleNoteClick(note.id)"
          >
            <h3 class="note-title">{{ note.title }}</h3>
            <p class="note-preview" v-if="note.content_preview">
              {{ note.content_preview }}
            </p>
            <div class="note-meta">
              <span class="publish-time">{{ formatTime(note.published_at) }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有公开文章" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserPublicNotes } from '@/api/notes'
import type { PublicNoteItem } from '@/types/note'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'
import { applyRouteSeo } from '@/utils/seo'

const route = useRoute()
const router = useRouter()
const appTitle = import.meta.env.VITE_APP_TITLE || '家书'

const userId = ref<string>(route.params.user_id as string)
const userInfo = ref<any>(null)
const notes = ref<PublicNoteItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

/**
 * 用户头像
 */
const userAvatar = computed(() => {
  return userInfo.value?.avatar || defaultAvatar
})

const displayName = computed(() => {
  return userInfo.value?.nickname || userInfo.value?.username || '用户'
})

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD')
}

/**
 * 头像加载错误处理
 */
const handleAvatarError = () => {
  // 使用默认头像
}

/**
 * 点击笔记
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
 * 获取用户公开文章
 */
const fetchNotes = async () => {
  loading.value = true
  try {
    const response = await getUserPublicNotes(userId.value, {
      page: currentPage.value,
      page_size: pageSize.value,
    })

    if (response) {
      notes.value = response.list
      total.value = response.total

      const author = response.list?.[0]?.author
      if (author) {
        userInfo.value = {
          id: author.id,
          nickname: author.nickname,
          avatar: author.avatar,
        }
      }

      const pageTitle = `${displayName.value}的主页 - ${appTitle}`
      const description =
        total.value > 0
          ? `${displayName.value}在家书发布了 ${total.value} 篇公开图文笔记，浏览 TA 分享的生活记录与温暖瞬间。`
          : `${displayName.value}的家书主页，浏览 TA 分享的公开图文笔记与生活记录。`

      document.title = pageTitle
      applyRouteSeo({
        description,
        canonicalPath: route.path,
        robots: 'index, follow',
        ogType: 'profile',
      })
    }
  } catch (error) {
    console.error('获取用户文章失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotes()
})

watch(
  () => route.params.user_id,
  (nextUserId) => {
    userId.value = nextUserId as string
    currentPage.value = 1
    userInfo.value = null
    fetchNotes()
  }
)
</script>

<style scoped>
.user-profile-container {
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
}

.profile-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.user-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-light);
  margin-bottom: var(--spacing-md);
}

.user-name {
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.user-bio {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin: 0;
}

.notes-section {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.note-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  border: 1px solid transparent;
}

.note-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

.note-title {
  font-size: var(--font-size-h4);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.note-preview {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  justify-content: flex-end;
}

.publish-time {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.pagination {
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: center;
}
</style>
