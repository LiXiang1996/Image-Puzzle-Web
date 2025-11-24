/**
 * 消费状态管理 Store
 * 管理用户的消费历史记录和统计信息
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ConsumptionRecord } from '@/types/consumption'
import { getConsumptionHistory, type ConsumptionHistoryResponse } from '@/api/consumption'

export const useConsumptionStore = defineStore('consumption', () => {
  // 消费记录列表
  const records = ref<ConsumptionRecord[]>([])
  // 加载状态
  const loading = ref(false)
  // 总记录数（用于分页）
  const total = ref(0)

  /**
   * 获取消费历史
   * 支持分页查询用户的消费记录
   * @param page 页码，从 1 开始
   * @param pageSize 每页记录数
   */
  const fetchConsumptionHistory = async (page = 1, pageSize = 10) => {
    loading.value = true
    try {
      // 调用API获取消费历史
      // 后端返回格式：{code: 200, message: "success", data: {list: [], total: 0, page: 1, pageSize: 10}}
      // request拦截器会自动提取data字段
      const response = (await getConsumptionHistory({ page, pageSize })) as unknown as ConsumptionHistoryResponse
      
      // 确保响应数据格式正确
      if (response && typeof response === 'object') {
        records.value = Array.isArray(response.list) ? response.list : []
        total.value = typeof response.total === 'number' ? response.total : 0
      } else {
        records.value = []
        total.value = 0
      }
      
      return response
    } catch (error) {
      console.error('获取消费历史失败:', error)
      records.value = [] // 失败时清空列表
      total.value = 0
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    total,
    fetchConsumptionHistory,
  }
})

