/**
 * 工具函数集合
 * 提供常用的工具函数，如日期格式化、防抖、节流等
 */

/**
 * 格式化日期
 * 将日期对象或日期字符串格式化为中文本地化格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date): string => {
  // 这里可以使用 dayjs 或其他日期库
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 防抖函数
 * 在指定时间内，如果函数被多次调用，只执行最后一次
 * 常用于搜索输入框、窗口 resize 等场景
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 节流函数
 * 在指定时间内，函数最多执行一次
 * 常用于滚动事件、鼠标移动等高频事件
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * 使用 JSON 序列化实现深拷贝
 * 注意：此方法无法拷贝函数、undefined、Symbol 等特殊类型
 * @param obj 要拷贝的对象
 * @returns 拷贝后的新对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

