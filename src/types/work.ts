export interface Work {
  id: string
  title: string
  description?: string
  imageUrl: string
  prompt: string
  negativePrompt?: string
  model?: string
  parameters?: {
    width?: number
    height?: number
    steps?: number
    guidance?: number
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

