export interface ConsumptionRecord {
  id: string
  type: 'image_generation' | 'premium_feature' | 'subscription'
  amount: number
  description: string
  status: 'success' | 'failed' | 'refunded'
  createdAt: string
}

