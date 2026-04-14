<template>
  <div class="build-info-badge" :title="tooltip">
    <div class="build-info-line">
      <span class="build-info-label">版本</span>
      <span class="build-info-value">v{{ buildInfo.version }}</span>
    </div>
    <div class="build-info-line">
      <span class="build-info-label">更新</span>
      <span class="build-info-value">{{ formattedBuiltAt }}</span>
    </div>
    <div v-if="shortCommitSha" class="build-info-line">
      <span class="build-info-label">提交</span>
      <span class="build-info-value">{{ shortCommitSha }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { buildInfo } from '@/generated/buildInfo'

const formattedBuiltAt = computed(() => {
  const value = dayjs(buildInfo.builtAt)
  if (!value.isValid()) return '未知'
  return value.format('YYYY-MM-DD HH:mm')
})

const shortCommitSha = computed(() => {
  return buildInfo.commitSha ? buildInfo.commitSha.slice(0, 7) : ''
})

const tooltip = computed(() => {
  const parts = [
    `版本: v${buildInfo.version}`,
    `构建时间: ${formattedBuiltAt.value}`,
  ]

  if (buildInfo.commitRef) {
    parts.push(`分支: ${buildInfo.commitRef}`)
  }

  if (buildInfo.commitSha) {
    parts.push(`提交: ${buildInfo.commitSha}`)
  }

  if (buildInfo.deploymentId) {
    parts.push(`部署: ${buildInfo.deploymentId}`)
  }

  return parts.join('\n')
})
</script>

<style scoped>
.build-info-badge {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1200;
  min-width: 164px;
  padding: 10px 12px;
  border: 1px solid rgba(224, 213, 204, 0.95);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(62, 39, 35, 0.12);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  pointer-events: none;
}

.build-info-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.build-info-line + .build-info-line {
  margin-top: 4px;
}

.build-info-label {
  color: var(--text-tertiary);
}

.build-info-value {
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .build-info-badge {
    right: 12px;
    bottom: 12px;
    min-width: 148px;
    padding: 8px 10px;
    font-size: 11px;
  }
}
</style>
