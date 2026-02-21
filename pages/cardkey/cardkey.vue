<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="header-title">卡密充值</text>
    </view>
    <view class="content">
      <view class="card">
        <text class="card-title">输入卡密</text>
        <input class="card-input" v-model="cardKey" placeholder="请输入卡密" />
        <button class="redeem-btn" :loading="loading" @click="redeem">立即充值</button>
      </view>
      
      <!-- 当前卡密信息 -->
      <view class="section" v-if="cardKeyInfo">
        <text class="section-title">当前会员信息</text>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">会员状态</text>
            <text class="info-value" :class="{ active: !cardKeyInfo.isExpired }">
              {{ cardKeyInfo.isExpired ? '已过期' : '有效' }}
            </text>
          </view>
          <view class="info-item" v-if="cardKeyInfo.expiresAt">
            <text class="info-label">到期时间</text>
            <text class="info-value">{{ formatTime(cardKeyInfo.expiresAt) }}</text>
          </view>
          <view class="info-item" v-if="cardKeyInfo.daysRemaining !== undefined && !cardKeyInfo.isExpired">
            <text class="info-label">剩余天数</text>
            <text class="info-value">{{ cardKeyInfo.daysRemaining }} 天</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() { 
    return { 
      cardKey: '', 
      loading: false,
      cardKeyInfo: null
    } 
  },
  onShow() { 
    this.loadCardKeyInfo()
  },
  methods: {
    goBack() { uni.navigateBack() },
    loadCardKeyInfo() {
      uni.request({
        url: '/api/user/cardkey',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.hasCardKey && res.data.cardKeyInfo) {
            this.cardKeyInfo = res.data.cardKeyInfo
          }
        }
      })
    },
    async redeem() {
      if (!this.cardKey) {
        uni.showToast({ title: '请输入卡密', icon: 'none' })
        return
      }
      
      this.loading = true
      
      uni.request({
        url: '/api/user/cardkey',
        method: 'POST',
        data: { cardKey: this.cardKey },
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.ok) {
            uni.showToast({ title: '充值成功', icon: 'success' })
            this.cardKey = ''
            if (res.data.cardKeyInfo) {
              this.cardKeyInfo = res.data.cardKeyInfo
            } else {
              this.loadCardKeyInfo()
            }
          } else {
            uni.showToast({ title: res.data?.error || '充值失败', icon: 'none' })
          }
        },
        fail: () => { 
          uni.showToast({ title: '请求失败', icon: 'none' }) 
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
      const date = new Date(ts)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}`
    }
  }
}
</script>
<style>
.page { height: 100vh; background: #0f0f1a; }
.header { display: flex; align-items: center; padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; font-weight: bold; }
.content { padding: 24rpx; }
.card { padding: 32rpx; background: #1a1a2e; border-radius: 16rpx; margin-bottom: 24rpx; }
.card-title { color: #fff; font-size: 30rpx; margin-bottom: 24rpx; display: block; }
.card-input { width: 100%; height: 88rpx; padding: 0 24rpx; background: #0f0f1a; border-radius: 12rpx; color: #fff; font-size: 30rpx; box-sizing: border-box; }
.redeem-btn { width: 100%; height: 88rpx; background: #ff6b6b; color: #fff; font-size: 32rpx; border-radius: 12rpx; margin-top: 24rpx; }
.section { background: #1a1a2e; border-radius: 16rpx; padding: 24rpx; }
.section-title { color: #fff; font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; display: block; }
.info-list { }
.info-item { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #2d2d44; }
.info-item:last-child { border-bottom: none; }
.info-label { color: #aaa; font-size: 28rpx; }
.info-value { color: #fff; font-size: 28rpx; }
.info-value.active { color: #4ecdc4; }
</style>
