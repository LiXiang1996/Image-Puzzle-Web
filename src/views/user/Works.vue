<template>
  <div class="works">
    <el-card>
      <template #header>
        <div class="header">
          <h2>我的作品</h2>
          <el-button type="primary" @click="$router.push('/home')">
            <el-icon><Plus /></el-icon>
            新建作品
          </el-button>
        </div>
      </template>
      <el-row :gutter="20" v-loading="worksStore.loading">
        <el-col :span="6" v-for="work in worksStore.works" :key="work.id">
          <el-card class="work-card" :body-style="{ padding: '0px' }">
            <img :src="work.imageUrl" class="work-image" />
            <div class="work-info">
              <h3>{{ work.title }}</h3>
              <p>{{ work.description || '暂无描述' }}</p>
              <div class="work-actions">
                <el-button type="text" @click="handleView(work)">查看</el-button>
                <el-button type="text" @click="handleDelete(work.id)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="!worksStore.loading && worksStore.works.length === 0" description="暂无作品" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWorksStore } from '@/stores/works'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Work } from '@/types/work'

const worksStore = useWorksStore()

const handleView = async (work: Work) => {
  // 可以跳转到作品详情页，或者显示作品详情对话框
  // 这里先显示一个简单的提示
  ElMessage.info(`查看作品：${work.title}`)
  // TODO: 可以添加作品详情对话框或跳转到详情页
}

const handleDelete = async (workId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个作品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await worksStore.removeWork(workId)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  worksStore.fetchWorks()
})
</script>

<style scoped>
.works {
  max-width: 1400px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-card {
  margin-bottom: 20px;
}

.work-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.work-info {
  padding: 15px;
}

.work-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.work-info p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-actions {
  display: flex;
  gap: 10px;
}
</style>

