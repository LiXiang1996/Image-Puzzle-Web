/**
 * 消费相关 API
 * 处理用户消费历史记录和统计信息
 */
import request from './request'
import type { ConsumptionRecord } from '@/types/consumption'

/**
 * 消费历史查询参数接口
 */
export interface ConsumptionHistoryParams {
  page?: number // 页码
  pageSize?: number // 每页记录数
  startDate?: string // 开始日期
  endDate?: string // 结束日期
}

/**
 * 消费历史响应接口
 */
export interface ConsumptionHistoryResponse {
  list: ConsumptionRecord[] // 消费记录列表
  total: number // 总记录数
  page: number // 当前页码
  pageSize: number // 每页记录数
}

/**
 * 获取消费历史记录
 * @param params 查询参数（分页、日期范围等）
 * @returns 消费历史响应（包含列表和分页信息）
 */
export const getConsumptionHistory = (params: ConsumptionHistoryParams) => {
  // 后端使用 page_size 和 start_date/end_date，需要转换参数名
  const backendParams = {
    page: params.page,
    page_size: params.pageSize,
    start_date: params.startDate,
    end_date: params.endDate
  }
  return request.get<ConsumptionHistoryResponse>('/consumption/history', { params: backendParams })
}

/**
 * 获取消费统计信息
 * @returns 消费统计数据
 */
export const getConsumptionStats = () => {
  return request.get('/consumption/stats')
}

