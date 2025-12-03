<template>
  <el-dialog
    v-model="visible"
    title="发布回忆瞬间"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="upload-dialog-content">
      <!-- 第一栏：图片上传 -->
      <div class="upload-section">
        <div class="upload-area" v-if="!uploadedImageUrl">
          <el-upload
            class="image-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
            accept="image/*"
            drag
          >
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">
              <p>点击或拖拽图片到此处上传</p>
              <p class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
            </div>
          </el-upload>
        </div>
        
        <div class="image-preview" v-else>
          <img :src="uploadedImageUrl" alt="预览" class="preview-image" />
          <div class="image-actions">
            <el-button type="text" @click="handleRemoveImage">重新选择</el-button>
          </div>
        </div>
      </div>

      <!-- 第二栏：图片描述 -->
      <div class="description-section">
        <el-input
          v-model="description"
          type="textarea"
          :rows="3"
          placeholder="写下你的回忆描述（50字以内）..."
          :maxlength="50"
          show-word-limit
          class="description-input"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handlePublish"
          :loading="uploading || publishing"
          :disabled="!uploadedImageUrl"
        >
          上传并发布
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadMemoryImage, createMemoryMoment } from '@/api/memory'
import { compressImage } from '@/utils/imageCompress'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const visible = ref(props.modelValue)
const uploadedImageUrl = ref<string>('')
const description = ref('')
const uploading = ref(false)
const publishing = ref(false)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (!newVal) {
    // 关闭时重置
    resetForm()
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

/**
 * 处理图片选择
 */
const handleImageChange = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  // 检查文件类型
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  uploading.value = true
  try {
    // 压缩图片（如果大于5MB）
    const compressedFile = await compressImage(rawFile, 5, 0.8)
    
    // 上传图片（临时存储）
    const response = await uploadMemoryImage(compressedFile)
    uploadedImageUrl.value = response.url || response.image || ''
    
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    console.error('上传图片失败:', error)
    ElMessage.error(error.response?.data?.detail || '上传图片失败，请重试')
  } finally {
    uploading.value = false
  }
}

/**
 * 移除图片
 */
const handleRemoveImage = () => {
  uploadedImageUrl.value = ''
  description.value = ''
}

/**
 * 发布回忆瞬间
 */
const handlePublish = async () => {
  if (!uploadedImageUrl.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (description.value && description.value.length > 50) {
    ElMessage.warning('描述不能超过50字')
    return
  }

  publishing.value = true
  try {
    await createMemoryMoment({
      image_url: uploadedImageUrl.value,
      description: description.value || undefined,
    })
    
    ElMessage.success('发布成功！')
    emit('success')
    handleClose()
  } catch (error: any) {
    console.error('发布失败:', error)
    ElMessage.error(error.response?.data?.detail || '发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  visible.value = false
  resetForm()
}

/**
 * 重置表单
 */
const resetForm = () => {
  uploadedImageUrl.value = ''
  description.value = ''
  uploading.value = false
  publishing.value = false
}
</script>

<style scoped>
.upload-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.upload-section {
  min-height: 300px;
}

.upload-area {
  width: 100%;
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload) {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.upload-icon {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

.upload-text {
  text-align: center;
}

.upload-text p {
  margin: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.upload-tip {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.image-preview {
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-md);
  /* 不强制尺寸，让图片保持原始尺寸，避免小图标被过度放大 */
}

.image-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
}

.description-section {
  width: 100%;
}

.description-input :deep(.el-textarea__inner) {
  border-color: var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>

