<template>
  <div class="comment-item">
    <div class="comment-header">
      <img
        :src="comment.author.avatar || defaultAvatar"
        :alt="comment.author.nickname"
        class="comment-avatar"
        @error="handleAvatarError"
      />
      <div class="comment-info">
        <span class="comment-author">{{ comment.author.nickname }}</span>
        <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
      </div>
      <div class="comment-actions" v-if="currentUserId === comment.user_id">
        <el-button
          type="text"
          size="small"
          @click="handleDelete"
          class="delete-btn"
        >
          删除
        </el-button>
      </div>
    </div>
    
    <div class="comment-content">
      {{ comment.content }}
    </div>
    
    <div class="comment-footer">
      <el-button
        type="text"
        size="small"
        @click="handleReply"
        class="reply-btn"
      >
        回复
      </el-button>
    </div>
    
    <!-- 嵌套回复 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :current-user-id="currentUserId"
        @reply="handleReply"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CommentItem } from '@/types/interaction'
import dayjs from 'dayjs'
import defaultAvatar from '@/assets/default_avatar.png'

interface Props {
  comment: CommentItem
  currentUserId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reply: [commentId: number, authorName: string]
  delete: [commentId: number]
}>()

const avatarError = ref(false)

const formatTime = (timeStr: string) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

const handleAvatarError = () => {
  avatarError.value = true
}

const handleReply = () => {
  emit('reply', parseInt(props.comment.id), props.comment.author.nickname)
}

const handleDelete = () => {
  emit('delete', parseInt(props.comment.id))
}
</script>

<style scoped>
.comment-item {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: background-color 0.3s;
}

.comment-item:hover {
  background-color: var(--bg-hover);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-author {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.comment-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.delete-btn {
  color: var(--error-color);
  font-size: var(--font-size-sm);
}

.delete-btn:hover {
  color: var(--error-color);
  background-color: rgba(229, 115, 115, 0.1);
}

.comment-content {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.reply-btn {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.reply-btn:hover {
  color: var(--primary-color);
}

.comment-replies {
  margin-top: var(--spacing-md);
  margin-left: var(--spacing-xl);
  padding-left: var(--spacing-md);
  border-left: 2px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>

