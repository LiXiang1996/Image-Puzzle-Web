/**
 * 作品状态管理 Store
 * 管理用户生成的作品列表和相关操作
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Work } from '@/types/work'
import { getWorks, createWork, deleteWork } from '@/api/works'

export const useWorksStore = defineStore('works', () => {
  // 作品列表
  const works = ref<Work[]>([])
  // 加载状态
  const loading = ref(false)

  /**
   * 获取作品列表
   * 从服务器获取用户的所有作品
   * @param page 页码（可选，默认1）
   * @param pageSize 每页记录数（可选，默认10）
   */
  const fetchWorks = async (page = 1, pageSize = 10) => {
    loading.value = true
    try {
      // 调用API获取作品列表
      // 后端返回格式：{code: 200, message: "success", data: Work[]}
      // request拦截器会自动提取data字段
      const response = (await getWorks({ page, pageSize })) as unknown as Work[]
      works.value = Array.isArray(response) ? response : []
      return response
    } catch (error) {
      console.error('获取作品列表失败:', error)
      works.value = [] // 失败时清空列表
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建作品
   * 创建新的作品并添加到列表顶部
   */
  const addWork = async (workData: Partial<Work>) => {
    try {
      const response = (await createWork(workData)) as unknown as Work
      // 使用 unshift 将新作品添加到列表顶部
      works.value.unshift(response)
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 删除作品
   * 从服务器删除作品，并从列表中移除
   * @param workId 作品ID
   */
  const removeWork = async (workId: string) => {
    try {
      // 调用API删除作品
      await deleteWork(workId)
      // 从列表中过滤掉已删除的作品
      works.value = works.value.filter((work) => work.id !== workId)
    } catch (error) {
      console.error('删除作品失败:', error)
      throw error
    }
  }

  return {
    works,
    loading,
    fetchWorks,
    addWork,
    removeWork,
  }
})

