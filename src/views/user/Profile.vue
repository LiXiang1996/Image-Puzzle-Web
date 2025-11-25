<template>
  <div class="profile">
    <el-card>
      <template #header>
        <h2>个人资料</h2>
      </template>
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" />
        </el-form-item>
        <el-form-item label="头像">
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
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
          <el-button @click="loadUserInfo" style="margin-left: 10px">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
.profile {
  max-width: 800px;
}

.avatar-uploader {
  display: flex;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.uploading-overlay {
  width: 178px;
  height: 178px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: #409eff;
  gap: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>

