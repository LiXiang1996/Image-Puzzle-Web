<template>
  <div class="consumption">
    <el-card>
      <template #header>
        <h2>消费历史</h2>
      </template>
      <el-table :data="consumptionStore.records" v-loading="consumptionStore.loading" stripe>
        <el-table-column prop="type" label="类型" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'image_generation'">图片生成</el-tag>
            <el-tag v-else-if="row.type === 'premium_feature'">高级功能</el-tag>
            <el-tag v-else>订阅</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'success'" type="success">成功</el-tag>
            <el-tag v-else-if="row.status === 'failed'" type="danger">失败</el-tag>
            <el-tag v-else type="warning">已退款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="consumptionStore.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConsumptionStore } from '@/stores/consumption'
import dayjs from 'dayjs'

const consumptionStore = useConsumptionStore()

const currentPage = ref(1)
const pageSize = ref(10)

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}

const loadData = () => {
  consumptionStore.fetchConsumptionHistory(currentPage.value, pageSize.value)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.consumption {
  max-width: 1200px;
}
</style>

