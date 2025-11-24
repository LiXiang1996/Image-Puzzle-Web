<template>
  <div class="membership-page">
    <div class="membership-container">
      <!-- 返回按钮 -->
      <div class="back-button-wrapper">
        <el-button 
          type="text" 
          class="back-button"
          @click="router.push('/home')"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span>返回首页</span>
        </el-button>
      </div>
      
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">选择会员套餐</h1>
        <p class="page-subtitle">解锁更多创作能力，享受专属权益</p>
      </div>

      <!-- 会员卡片列表 -->
      <div class="membership-cards">
        <!-- 基础会员 -->
        <div class="membership-card" :class="{ 'recommended': false }">
          <div class="card-header">
            <h3 class="card-title">基础会员</h3>
            <div class="card-badge">入门首选</div>
          </div>
          <div class="card-price">
            <span class="price-amount">$5</span>
            <span class="price-unit">/月</span>
          </div>
          <div class="card-features">
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>每月赠送 <strong>500</strong> 积分</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>文生图：<strong>10</strong> 积分/次</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>图生图：<strong>15</strong> 积分/次</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>支持 <strong>512x512</strong> 分辨率</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>基础AI模型选择</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>作品存储 <strong>50</strong> 张</span>
            </div>
          </div>
          <el-button 
            type="default" 
            class="card-button"
            @click="handlePurchase('basic')"
          >
            立即购买
          </el-button>
        </div>

        <!-- 标准会员 -->
        <div class="membership-card recommended">
          <div class="card-header">
            <h3 class="card-title">标准会员</h3>
            <div class="card-badge recommended-badge">推荐</div>
          </div>
          <div class="card-price">
            <span class="price-amount">$20</span>
            <span class="price-unit">/月</span>
          </div>
          <div class="card-features">
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>每月赠送 <strong>2000</strong> 积分</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>文生图：<strong>8</strong> 积分/次（优惠20%）</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>图生图：<strong>12</strong> 积分/次（优惠20%）</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>支持 <strong>768x768</strong> 分辨率</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>高级AI模型选择</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>作品存储 <strong>200</strong> 张</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>优先生成队列</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>批量生成功能</span>
            </div>
          </div>
          <el-button 
            type="primary" 
            class="card-button"
            @click="handlePurchase('standard')"
          >
            立即购买
          </el-button>
        </div>

        <!-- 高级会员 -->
        <div class="membership-card premium">
          <div class="card-header">
            <h3 class="card-title">高级会员</h3>
            <div class="card-badge premium-badge">尊享</div>
          </div>
          <div class="card-price">
            <span class="price-amount">$50</span>
            <span class="price-unit">/月</span>
          </div>
          <div class="card-features">
            <div class="feature-item">
              <el-icon class="feature-icon premium-icon"><Star /></el-icon>
              <span><strong>无限积分</strong> - 畅享无限制创作</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>文生图：<strong>免费</strong></span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>图生图：<strong>免费</strong></span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>支持 <strong>1024x1024</strong> 高分辨率</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>所有AI模型无限制使用</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>作品存储 <strong>无限</strong> 张</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>最高优先级生成队列</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>批量生成 + 系列组图</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>专属客服支持</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>新功能优先体验</span>
            </div>
          </div>
          <el-button 
            type="warning" 
            class="card-button premium-button"
            @click="handlePurchase('premium')"
          >
            立即购买
          </el-button>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="faq-section">
        <h2 class="faq-title">常见问题</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h4>积分如何计算？</h4>
            <p>基础会员每月赠送500积分，标准会员2000积分，高级会员无限积分。积分可用于文生图和图生图功能。</p>
          </div>
          <div class="faq-item">
            <h4>会员可以随时取消吗？</h4>
            <p>可以，您可以随时在个人中心取消会员订阅，已购买的会员权益在到期前仍然有效。</p>
          </div>
          <div class="faq-item">
            <h4>未使用的积分会过期吗？</h4>
            <p>基础会员和标准会员的积分按月清零，高级会员无此限制。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Star, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

/**
 * 处理购买会员
 * @param type 会员类型：basic | standard | premium
 */
const handlePurchase = async (type: string) => {
  const plans = {
    basic: { name: '基础会员', price: '$5' },
    standard: { name: '标准会员', price: '$20' },
    premium: { name: '高级会员', price: '$50' }
  }
  
  const plan = plans[type as keyof typeof plans]
  
  try {
    await ElMessageBox.confirm(
      `确定购买 ${plan.name}（${plan.price}/月）吗？`,
      '确认购买',
      {
        confirmButtonText: '确认购买',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    
    // TODO: 调用支付接口
    ElMessage.success(`${plan.name}购买成功！`)
    
    // 这里可以跳转到支付页面或调用支付接口
    // router.push('/payment')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.membership-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  overflow-y: auto;
}

.membership-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* 返回按钮 */
.back-button-wrapper {
  margin-bottom: 30px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 50px;
  color: white;
}

.page-title {
  font-size: 42px;
  font-weight: bold;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

/* 会员卡片容器 */
.membership-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

/* 会员卡片 */
.membership-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.membership-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.membership-card.recommended {
  border: 3px solid #409eff;
  transform: scale(1.05);
}

.membership-card.premium {
  border: 3px solid #e6a23c;
  background: linear-gradient(135deg, #fff 0%, #fff9e6 100%);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.card-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #f0f2f5;
  color: #606266;
}

.card-badge.recommended-badge {
  background: #409eff;
  color: white;
}

.card-badge.premium-badge {
  background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
  color: white;
}

/* 价格 */
.card-price {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
}

.price-amount {
  font-size: 48px;
  font-weight: bold;
  color: #303133;
}

.price-unit {
  font-size: 18px;
  color: #909399;
  margin-left: 4px;
}

/* 功能列表 */
.card-features {
  flex: 1;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
}

.feature-icon {
  color: #67c23a;
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.feature-icon.premium-icon {
  color: #e6a23c;
}

.feature-item strong {
  color: #303133;
  font-weight: 600;
}

/* 购买按钮 */
.card-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.card-button.premium-button {
  background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
  border: none;
  color: white;
}

.card-button.premium-button:hover {
  background: linear-gradient(135deg, #f39c12 0%, #e6a23c 100%);
}

/* 常见问题 */
.faq-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.faq-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 32px 0;
  color: #303133;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.faq-item h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.faq-item p {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .membership-cards {
    grid-template-columns: 1fr;
  }
  
  .membership-card.recommended {
    transform: scale(1);
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
}
</style>

