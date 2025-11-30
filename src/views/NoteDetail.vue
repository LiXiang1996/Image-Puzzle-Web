<template>
  <div class="note-detail-container">
    <div class="detail-wrapper" v-loading="loading">
      <div v-if="note" class="note-content-wrapper">
        <!-- 主内容区域 -->
        <div class="note-content">
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

        <!-- 右侧操作栏（不是自己的文章时显示） -->
        <div class="action-sidebar" v-if="!isOwnNote && userStore.isAuthenticated">
          <div class="action-item" @click="handleLike" :class="{ active: likeData.is_liked }">
            <el-icon class="action-icon" :class="{ liked: likeData.is_liked }">
              <Heart />
            </el-icon>
            <span class="action-count">{{ likeData.like_count }}</span>
            <span class="action-label">喜爱</span>
          </div>
          
          <div class="action-item" @click="handleFavorite" :class="{ active: favoriteData.is_favorited }">
            <el-icon class="action-icon" :class="{ favorited: favoriteData.is_favorited }">
              <Star />
            </el-icon>
            <span class="action-count">{{ favoriteData.favorite_count }}</span>
            <span class="action-label">收藏</span>
          </div>
          
          <div class="action-item" @click="scrollToComments">
            <el-icon class="action-icon">
              <ChatLineRound />
            </el-icon>
            <span class="action-count">{{ commentCount }}</span>
            <span class="action-label">评论</span>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div v-if="note && !isOwnNote" class="comments-section" ref="commentsSectionRef">
        <h3 class="comments-title">评论 ({{ commentCount }})</h3>
        
        <!-- 评论输入框（需要登录） -->
        <div v-if="userStore.isAuthenticated" class="comment-input-wrapper">
          <el-input
            v-model="newCommentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            :maxlength="500"
            show-word-limit
            class="comment-input"
          />
          <div class="comment-input-actions">
            <el-button 
              type="primary" 
              @click="handleSubmitComment"
              :loading="submittingComment"
              :disabled="!newCommentContent.trim()"
            >
              发表评论
            </el-button>
          </div>
        </div>
        <div v-else class="comment-login-tip">
          <el-button type="text" @click="router.push('/login')">登录后即可评论</el-button>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list" v-loading="loadingComments">
          <CommentList 
            v-if="comments.length > 0"
            :comments="comments"
            @reply="handleReply"
            @delete="handleDeleteComment"
          />
          <el-empty v-else description="暂无评论，快来抢沙发吧~" />
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
import { 
  toggleLike, 
  getLikeCount, 
  toggleFavorite, 
  getFavoriteCount,
  createComment,
  getComments,
  deleteComment
} from '@/api/interaction'
import type { CommentItem } from '@/types/interaction'
import { ElMessage } from 'element-plus'
import { 
  Heart, 
  Star, 
  ChatLineRound 
} from '@element-plus/icons-vue'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const note = ref<NoteDetail | null>(null)
const loading = ref(false)
const authorAvatar = ref<string>('')
const authorName = ref<string>('')

// 喜爱（点赞）相关
const likeData = ref({
  is_liked: false,
  like_count: 0
})
const liking = ref(false)

// 收藏相关
const favoriteData = ref({
  is_favorited: false,
  favorite_count: 0
})
const favoriting = ref(false)

// 评论相关
const comments = ref<CommentItem[]>([])
const commentCount = ref(0)
const loadingComments = ref(false)
const newCommentContent = ref('')
const submittingComment = ref(false)
const replyingTo = ref<number | null>(null)
const commentsSectionRef = ref<HTMLElement | null>(null)

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
    if (response) {
      note.value = response as NoteDetail
      // 从响应中获取作者信息
      const author = (response as any).author
      if (author) {
        authorName.value = author.nickname || author.username || '作者'
        authorAvatar.value = author.avatar || defaultAvatar
      } else {
        authorName.value = '作者'
        authorAvatar.value = defaultAvatar
      }
      
      // 加载互动数据
      await Promise.all([
        loadLikeData(),
        loadFavoriteData(),
        loadComments()
      ])
    }
  } catch (error) {
    console.error('加载笔记详情失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载点赞数据
 */
const loadLikeData = async () => {
  if (!note.value) return
  try {
    const data = await getLikeCount(note.value.id)
    likeData.value = data
  } catch (error) {
    console.error('加载点赞数据失败:', error)
  }
}

/**
 * 加载收藏数据
 */
const loadFavoriteData = async () => {
  if (!note.value) return
  try {
    const data = await getFavoriteCount(note.value.id)
    favoriteData.value = data
  } catch (error) {
    console.error('加载收藏数据失败:', error)
  }
}

/**
 * 加载评论列表
 */
const loadComments = async () => {
  if (!note.value) return
  loadingComments.value = true
  try {
    const data = await getComments(note.value.id)
    comments.value = data.list || []
    commentCount.value = data.total || 0
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

/**
 * 处理点赞/取消点赞
 */
const handleLike = async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!note.value || liking.value) return
  
  liking.value = true
  try {
    const data = await toggleLike(note.value.id)
    likeData.value = data
    ElMessage.success(data.is_liked ? '已点赞' : '已取消点赞')
  } catch (error: any) {
    console.error('点赞失败:', error)
    ElMessage.error(error.response?.data?.detail || '操作失败，请重试')
  } finally {
    liking.value = false
  }
}

/**
 * 处理收藏/取消收藏
 */
const handleFavorite = async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!note.value || favoriting.value) return
  
  favoriting.value = true
  try {
    const data = await toggleFavorite(note.value.id)
    favoriteData.value = data
    ElMessage.success(data.is_favorited ? '已收藏' : '已取消收藏')
    
    // 如果收藏成功，跳转到收藏列表
    if (data.is_favorited) {
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/user/favorites')
      }, 500)
    }
  } catch (error: any) {
    console.error('收藏失败:', error)
    ElMessage.error(error.response?.data?.detail || '操作失败，请重试')
  } finally {
    favoriting.value = false
  }
}

/**
 * 滚动到评论区域
 */
const scrollToComments = () => {
  if (commentsSectionRef.value) {
    commentsSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * 提交评论
 */
const handleSubmitComment = async () => {
  if (!note.value || !newCommentContent.value.trim() || submittingComment.value) return
  
  submittingComment.value = true
  try {
    await createComment(note.value.id, {
      content: newCommentContent.value.trim(),
      parent_id: replyingTo.value || null
    })
    
    ElMessage.success('评论成功')
    newCommentContent.value = ''
    replyingTo.value = null
    
    // 重新加载评论列表
    await loadComments()
  } catch (error: any) {
    console.error('评论失败:', error)
    ElMessage.error(error.response?.data?.detail || '评论失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

/**
 * 回复评论
 */
const handleReply = (commentId: number, authorName: string) => {
  replyingTo.value = commentId
  newCommentContent.value = `@${authorName} `
  scrollToComments()
  // 聚焦到输入框
  setTimeout(() => {
    const textarea = document.querySelector('.comment-input textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  }, 100)
}

/**
 * 删除评论
 */
const handleDeleteComment = async (commentId: number) => {
  try {
    await deleteComment(commentId)
    ElMessage.success('删除成功')
    await loadComments()
  } catch (error: any) {
    console.error('删除评论失败:', error)
    ElMessage.error(error.response?.data?.detail || '删除失败，请重试')
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
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
  position: relative;
}

.note-content-wrapper {
  display: flex;
  gap: var(--spacing-xl);
  position: relative;
}

.note-content {
  flex: 1;
  min-width: 0;
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

/* 右侧操作栏 */
.action-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  min-width: 80px;
  align-items: center;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.3s;
  width: 100%;
}

.action-item:hover {
  background-color: var(--bg-hover);
}

.action-item.active {
  background-color: var(--bg-hover);
}

.action-icon {
  font-size: 24px;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.action-item:hover .action-icon {
  color: var(--primary-color);
}

.action-icon.liked {
  color: #e57373;
}

.action-icon.favorited {
  color: #ffb74d;
}

.action-count {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.action-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* 评论区域 */
.comments-section {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-light);
}

.comments-title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.comment-input-wrapper {
  margin-bottom: var(--spacing-xl);
}

.comment-input {
  margin-bottom: var(--spacing-md);
}

.comment-input :deep(.el-textarea__inner) {
  border-color: var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.comment-input-actions {
  display: flex;
  justify-content: flex-end;
}

.comment-login-tip {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-tertiary);
}

.comments-list {
  margin-top: var(--spacing-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .note-content-wrapper {
    flex-direction: column;
  }
  
  .action-sidebar {
    position: static;
    flex-direction: row;
    justify-content: space-around;
    min-width: auto;
  }
  
  .action-item {
    flex: 1;
  }
}
</style>

