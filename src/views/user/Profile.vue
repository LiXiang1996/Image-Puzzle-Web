<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <h2 class="profile-title">个人资料</h2>
        <p class="profile-subtitle">管理你的账户信息和设置</p>
      </div>
      
      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :disabled="uploading"
            >
              <div v-if="uploading" class="uploading-overlay">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>上传中...</span>
              </div>
              <img v-else-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
              <div v-else class="avatar-placeholder">
                <el-icon class="avatar-icon"><Plus /></el-icon>
                <span class="avatar-text">上传头像</span>
              </div>
            </el-upload>
          </div>
          <p class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
        </div>

        <!-- 表单区域 -->
        <el-form 
          :model="profileForm" 
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input 
              v-model="profileForm.username" 
              disabled
              class="form-input"
            />
            <span class="form-tip">用户名不可修改</span>
          </el-form-item>
          
          <el-form-item label="昵称">
            <el-input 
              v-model="profileForm.nickname" 
              placeholder="请输入昵称"
              class="form-input"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input 
              v-model="profileForm.email" 
              placeholder="请输入邮箱地址"
              class="form-input"
              type="email"
            />
          </el-form-item>
          
          <el-form-item class="form-actions">
            <el-button 
              type="primary" 
              @click="handleSave" 
              :loading="loading"
              class="save-btn"
            >
              保存修改
            </el-button>
            <el-button 
              @click="loadUserInfo"
              class="reset-btn"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import { updateUserInfo, uploadAvatar } from '@/api/auth'
import { getFullUrl } from '@/utils/api'

const userStore = useUserStore()

const profileForm = ref({
  username: '',
  email: '',
  nickname: '',
  avatar: '',
})

const loading = ref(false)
const uploading = ref(false)

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 从store获取用户信息，如果没有则从服务器获取
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo()
    }
    
    if (userStore.userInfo) {
      // 处理头像URL：转换为完整URL
      const avatarUrl = userStore.userInfo.avatar ? getFullUrl(userStore.userInfo.avatar) : ''
      
      profileForm.value = {
        username: userStore.userInfo.username,
        email: userStore.userInfo.email || '',
        nickname: userStore.userInfo.nickname || '',
        avatar: avatarUrl,
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

onMounted(() => {
  loadUserInfo()
})

/**
 * 图片上传前的验证
 * @param file 上传的文件
 */
const beforeUpload = async (file: File) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  
  // 检查文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  
  // 上传图片
  uploading.value = true
  try {
    const response = await uploadAvatar(file)
    // 更新头像URL（转换为完整URL）
    // response 已经是 data 部分（响应拦截器已处理）
    const avatarUrl = (response as any).avatar || (response as any).url
    if (!avatarUrl) {
      ElMessage.error('上传失败：未返回头像URL')
      return false
    }
    const fullAvatarUrl = getFullUrl(avatarUrl)
    
    profileForm.value.avatar = fullAvatarUrl
    
    // 更新store中的用户信息
    if (userStore.userInfo) {
      userStore.userInfo.avatar = fullAvatarUrl
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
    }
    
    ElMessage.success('头像上传成功！')
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    uploading.value = false
  }
  
  // 阻止默认上传行为（我们已经手动上传了）
  return false
}

/**
 * 保存用户信息
 */
const handleSave = async () => {
  // 验证邮箱格式（如果填写了邮箱）
  if (profileForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }
  
  loading.value = true
  try {
    // 调用更新用户信息接口
    const response = await updateUserInfo({
      email: profileForm.value.email || undefined,
      nickname: profileForm.value.nickname || undefined,
    })
    
    // 更新store中的用户信息
    // response 已经是 data 部分（响应拦截器已处理）
    if (response && userStore.userInfo) {
      const userData = response as any
      userStore.userInfo.email = userData.email || userStore.userInfo.email
      userStore.userInfo.nickname = userData.nickname || userStore.userInfo.nickname
      userStore.userInfo.avatar = userData.avatar || userStore.userInfo.avatar
      // 更新本地存储
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
    }
    
    ElMessage.success('保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.profile-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
}

.profile-title {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.profile-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.profile-content {
  padding: var(--spacing-xl);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
}

.avatar-wrapper {
  margin-bottom: var(--spacing-md);
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  height: 100%;
}

.avatar-icon {
  font-size: 32px;
  color: var(--text-tertiary);
}

.avatar-text {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.uploading-overlay {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-full);
  color: var(--primary-color);
  gap: var(--spacing-sm);
  position: absolute;
  top: 0;
  left: 0;
}

.upload-tip {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: center;
  margin-top: var(--spacing-sm);
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.profile-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

.profile-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--font-size-base);
}

.form-input {
  max-width: 400px;
}

.form-input :deep(.el-input__inner) {
  border-color: var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s;
}

.form-input :deep(.el-input__inner:hover) {
  border-color: var(--primary-light);
}

.form-input :deep(.el-input__inner:focus) {
  border-color: var(--primary-color);
}

.form-input :deep(.el-input.is-disabled .el-input__inner) {
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.form-tip {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-left: var(--spacing-sm);
}

.form-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.save-btn {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
  transition: all 0.3s;
}

.save-btn:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.reset-btn {
  border-color: var(--border-color);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all 0.3s;
}

.reset-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary-color);
  background-color: var(--bg-hover);
}
</style>

