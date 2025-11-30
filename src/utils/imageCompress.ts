/**
 * 图片压缩工具函数
 * 用于压缩大于5MB的图片
 */

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param maxSizeMB 最大文件大小（MB），默认5MB
 * @param quality 压缩质量（0-1），默认0.8
 * @returns Promise<File> 压缩后的图片文件
 */
export function compressImage(
  file: File,
  maxSizeMB: number = 5,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 如果文件小于限制，直接返回
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 创建canvas进行压缩
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算压缩后的尺寸（保持宽高比）
        const maxDimension = 1920 // 最大尺寸
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片到canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 转换为blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'))
              return
            }

            // 如果压缩后仍然大于限制，降低质量继续压缩
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
              compressImage(file, maxSizeMB, quality - 0.1)
                .then(resolve)
                .catch(reject)
              return
            }

            // 创建新的File对象
            const compressedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          file.type || 'image/jpeg',
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

