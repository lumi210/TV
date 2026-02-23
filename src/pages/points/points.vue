<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="header-title">积分兑换</text>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 积分余额 -->
      <view class="balance-card">
        <text class="balance-label">当前积分</text>
        <text class="balance-value">{{ balance }}</text>
        <text class="balance-tip">积分可兑换会员卡密</text>
      </view>

      <!-- 兑换卡密 -->
      <view class="section">
        <text class="section-title">兑换会员</text>
        <view class="redeem-card">
          <view class="redeem-info">
            <text class="redeem-name">{{ cardKeyName }}</text>
            <text class="redeem-need">需要 {{ redeemThreshold }} 积分</text>
          </view>
          <button 
            class="redeem-btn" 
            :class="{ disabled: balance < redeemThreshold }"
            :disabled="balance < redeemThreshold || redeeming"
            @click="redeemCardKey"
          >
            {{ redeeming ? '兑换中...' : '立即兑换' }}
          </button>
        </view>
        <text class="redeem-tip" v-if="balance < redeemThreshold">
          还差 {{ redeemThreshold - balance }} 积分即可兑换
        </text>
      </view>

      <!-- 我的卡密 -->
      <view class="section" v-if="unusedCardKeys.length > 0">
        <text class="section-title">未使用卡密 ({{ unusedCardKeys.length }})</text>
        <view class="cardkey-list">
          <view class="cardkey-item" v-for="(item, index) in unusedCardKeys" :key="index">
            <view class="cardkey-info">
              <text class="cardkey-type">{{ getTypeName(item.type) }}</text>
              <text class="cardkey-expire">有效期至 {{ formatTime(item.expiresAt) }}</text>
            </view>
            <view class="cardkey-actions">
              <text class="cardkey-code" v-if="item.plainKey">{{ item.plainKey }}</text>
              <button class="copy-btn" v-if="item.plainKey" @click="copyCardKey(item)">
                复制
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 积分记录 -->
      <view class="section">
        <text class="section-title">积分记录</text>
        <view class="history-list">
          <view class="history-item" v-for="(item, index) in history" :key="index">
            <view class="history-info">
              <text class="history-reason">{{ item.reason }}</text>
              <text class="history-time">{{ formatTime(item.createdAt) }}</text>
            </view>
            <text class="history-amount" :class="{ minus: item.amount < 0 }">
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
            </text>
          </view>
        </view>
        <view class="empty" v-if="history.length === 0">
          <text>暂无积分记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { buildUrl } from "../../utils/request"
export default {
  data() {
    return {
      balance: 0,
      redeemThreshold: 300,
      cardKeyName: '周卡',
      history: [],
      unusedCardKeys: [],
      redeeming: false
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    goBack() { uni.navigateBack() },
    
    async loadData() {
      try {
        const [balanceRes, historyRes, configRes, cardKeysRes] = await Promise.all([
          this.request('/api/points/balance'),
          this.request('/api/points/history'),
          this.request('/api/invitation-config'),
          this.request('/api/cardkeys/my')
        ])
        
        if (balanceRes) this.balance = balanceRes.balance || 0
        if (historyRes) this.history = historyRes.history || []
        if (configRes) {
          this.redeemThreshold = configRes.redeemThreshold || 300
          this.cardKeyName = this.getTypeName(configRes.cardKeyType || 'week')
        }
        if (cardKeysRes) {
          // 筛选未过期且未使用的卡密
          this.unusedCardKeys = (cardKeysRes.cardKeys || []).filter(k => k.status === 'unused' && !k.isExpired)
        }
      } catch (e) {
        console.error('load data error:', e)
      }
    },

    request(url) {
      return new Promise((resolve, reject) => {
        uni.request({
          url,
          withCredentials: true,
          success: (res) => {
            if (res.data && !res.data.error) {
              resolve(res.data)
            } else {
              resolve(null)
            }
          },
          fail: reject
        })
      })
    },

    async redeemCardKey() {
      if (this.balance < this.redeemThreshold) {
        uni.showToast({ title: '积分不足', icon: 'none' })
        return
      }

      this.redeeming = true
      uni.request({
        url: buildUrl('/api/redeem/cardkey'),
        method: 'POST',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.success) {
            uni.showToast({ title: '兑换成功', icon: 'success' })
            this.loadData()
          } else {
            uni.showToast({ title: res.data?.error || '兑换失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '请求失败', icon: 'none' })
        },
        complete: () => {
          this.redeeming = false
        }
      })
    },

    copyCardKey(item) {
      if (item.plainKey) {
        uni.setClipboardData({
          data: item.plainKey,
          success: () => uni.showToast({ title: '已复制' })
        })
      }
    },

    getTypeName(type) {
      const map = { year: '年卡', quarter: '季卡', month: '月卡', week: '周卡' }
      return map[type] || '周卡'
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
      const date = new Date(ts)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; font-weight: bold; }
.content { flex: 1; padding: 24rpx; }
.balance-card { padding: 48rpx; background: linear-gradient(135deg, #ff6b6b, #ff8e8e); border-radius: 16rpx; text-align: center; margin-bottom: 24rpx; }
.balance-label { color: rgba(255,255,255,0.8); font-size: 28rpx; }
.balance-value { color: #fff; font-size: 72rpx; font-weight: bold; display: block; margin: 16rpx 0; }
.balance-tip { color: rgba(255,255,255,0.8); font-size: 24rpx; }
.section { background: #1a1a2e; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.section-title { color: #fff; font-size: 30rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.redeem-card { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; background: rgba(255, 215, 0, 0.1); border-radius: 12rpx; }
.redeem-info { }
.redeem-name { color: #ffd700; font-size: 32rpx; font-weight: bold; display: block; }
.redeem-need { color: #aaa; font-size: 24rpx; margin-top: 8rpx; display: block; }
.redeem-btn { background: #ffd700; color: #1a1a2e; padding: 16rpx 32rpx; border-radius: 24rpx; font-size: 26rpx; font-weight: bold; }
.redeem-btn.disabled { background: #555; color: #888; }
.redeem-tip { color: #888; font-size: 24rpx; margin-top: 12rpx; display: block; text-align: center; }
.cardkey-list { }
.cardkey-item { padding: 20rpx 0; border-bottom: 1rpx solid #2d2d44; }
.cardkey-item:last-child { border-bottom: none; }
.cardkey-info { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.cardkey-type { color: #fff; font-size: 28rpx; }
.cardkey-expire { color: #888; font-size: 24rpx; }
.cardkey-actions { display: flex; align-items: center; gap: 16rpx; }
.cardkey-code { flex: 1; color: #4ecdc4; font-size: 26rpx; font-family: monospace; }
.copy-btn { background: #4ecdc4; color: #fff; padding: 8rpx 24rpx; border-radius: 16rpx; font-size: 24rpx; }
.history-list { }
.history-item { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #2d2d44; }
.history-item:last-child { border-bottom: none; }
.history-info { flex: 1; }
.history-reason { color: #fff; font-size: 28rpx; display: block; }
.history-time { color: #888; font-size: 22rpx; margin-top: 4rpx; display: block; }
.history-amount { color: #4ecdc4; font-size: 30rpx; font-weight: bold; }
.history-amount.minus { color: #ff6b6b; }
.empty { padding: 32rpx; text-align: center; }
.empty text { color: #888; }
</style>
