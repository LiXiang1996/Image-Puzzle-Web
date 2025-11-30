<template>
  <div class="comment-list">
    <CommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :current-user-id="currentUserId"
      @reply="handleReply"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommentItem } from '@/types/interaction'
import CommentItem from './CommentItem.vue'
import { useUserStore } from '@/stores/user'

interface Props {
  comments: CommentItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reply: [commentId: number, authorName: string]
  delete: [commentId: number]
}>()

const userStore = useUserStore()

const currentUserId = computed(() => userStore.userInfo?.id || '')

const handleReply = (commentId: number, authorName: string) => {
  emit('reply', commentId, authorName)
}

const handleDelete = (commentId: number) => {
  emit('delete', commentId)
}
</script>

<style scoped>
.comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
</style>

