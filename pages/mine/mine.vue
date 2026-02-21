<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <view class="content">
      <view class="user-card" v-if="userInfo">
        <view class="user-header">
          <text class="username">{{ userInfo.username }}</text>
          <view class="vip-badge" v-if="cardKeyInfo && !cardKeyInfo.isExpired">
            <text>VIP</text>
          </view>
        </view>
        
        <!-- 卡密到期时间 -->
        <view class="cardkey-info" v-if="cardKeyInfo">
          <view class="cardkey-row">
            <text class="cardkey-label">会员状态</text>
            <text class="cardkey-value" :class="{ active: !cardKeyInfo.isExpired }">
              {{ cardKeyInfo.isExpired ? '已过期' : '有效' }}
            </text>
          </view>
          <view class="cardkey-row" v-if="cardKeyInfo.expiresAt">
            <text class="cardkey-label">到期时间</text>
            <text class="cardkey-value">{{ formatTime(cardKeyInfo.expiresAt) }}</text>
          </view>
          <view class="cardkey-row" v-if="cardKeyInfo.daysRemaining !== undefined && !cardKeyInfo.isExpired">
            <text class="cardkey-label">剩余天数</text>
            <text class="cardkey-value">{{ cardKeyInfo.daysRemaining }} 天</text>
          </view>
        </view>
        
        <view class="stats" v-if="userStats">
          <view class="stat-item" @click="goPage('/pages/points/points')">
            <text class="stat-value">{{ userStats.points || 0 }}</text>
            <text class="stat-label">积分</text>
          </view>
          <view class="stat-item" @click="goPage('/pages/favorites/favorites')">
            <text class="stat-value">{{ userStats.favoriteCount || 0 }}</text>
            <text class="stat-label">收藏</text>
          </view>
          <view class="stat-item" @click="goPage('/pages/history/history')">
            <text class="stat-value">{{ userStats.totalPlays || 0 }}</text>
            <text class="stat-label">观看</text>
          </view>
        </view>
      </view>
      <view class="user-card" v-else @click="goLogin">
        <text class="login-text">点击登录</text>
      </view>

      <view class="menu-section">
        <text class="section-title">会员中心</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/points/points')">
            <text>积分兑换</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" @click="goPage('/pages/invitation/invitation')">
            <text>邀请好友</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" @click="goPage('/pages/cardkey/cardkey')">
            <text>卡密充值</text>
            <text class="arrow">&gt;</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <text class="section-title">我的内容</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/favorites/favorites')">
            <text>我的收藏</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" @click="goPage('/pages/history/history')">
            <text>观看历史</text>
            <text class="arrow">&gt;</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <text class="section-title">设置</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/settings/settings')">
            <text>设置</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" v-if="userInfo" @click="changePassword">
            <text>修改密码</text>
            <text class="arrow">&gt;</text>
          </view>
        </view>
      </view>

      <view class="logout-btn" v-if="userInfo" @click="logout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      userStats: null,
      cardKeyInfo: null
    }
  },
  onShow() {
    this.userInfo = uni.getStorageSync('userInfo')
    if (this.userInfo) {
      this.loadUserStats()
      this.loadCardKeyInfo()
    }
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    goPage(url) {
      if (!this.userInfo && url !== '/pages/settings/settings') {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      uni.navigateTo({ url: url })
    },
    loadUserStats() {
      uni.request({
        url: '/api/user/my-stats',
        withCredentials: true,
        success: (res) => {
          if (res.data && !res.data.error) {
            this.userStats = res.data
          }
        }
      })
    },
    loadCardKeyInfo() {
      uni.request({
        url: '/api/user/cardkey',
        withCredentials: true,
        success: (res) => {
          console.log('cardkey:', res.data)
          if (res.data && res.data.hasCardKey && res.data.cardKeyInfo) {
            this.cardKeyInfo = res.data.cardKeyInfo
          }
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
    },
    changePassword() {
      uni.showModal({
        title: '修改密码',
        editable: true,
        placeholderText: '请输入新密码',
        success: (modalRes) => {
          if (modalRes.confirm && modalRes.content) {
            uni.request({
              url: '/api/change-password',
              method: 'POST',
              data: { newPassword: modalRes.content },
              withCredentials: true,
              success: (res) => {
                if (res.data && res.data.ok) {
                  uni.showToast({ title: '修改成功', icon: 'success' })
                } else {
                  uni.showToast({ title: res.data?.error || '修改失败', icon: 'none' })
                }
              },
              fail: () => {
                uni.showToast({ title: '请求失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userInfo')
            this.userInfo = null
            uni.showToast({ title: '已退出' })
          }
        }
      })
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 24rpx; padding-top: calc(24rpx + constant(safe-area-inset-top)); padding-top: calc(24rpx + env(safe-area-inset-top)); background: #1a1a2e; }
.header-title { color: #fff; font-size: 36rpx; font-weight: bold; }
.content { padding: 24rpx; }
.user-card { padding: 32rpx; background: #1a1a2e; border-radius: 16rpx; margin-bottom: 24rpx; }
.user-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.username { color: #fff; font-size: 36rpx; font-weight: bold; }
.vip-badge { margin-left: 16rpx; padding: 4rpx 16rpx; background: linear-gradient(135deg, #ffd700, #ffaa00); border-radius: 16rpx; }
.vip-badge text { color: #1a1a2e; font-size: 22rpx; font-weight: bold; }
.cardkey-info { padding: 16rpx; background: rgba(255, 215, 0, 0.1); border-radius: 12rpx; margin-bottom: 16rpx; }
.cardkey-row { display: flex; justify-content: space-between; padding: 8rpx 0; }
.cardkey-label { color: #aaa; font-size: 26rpx; }
.cardkey-value { color: #fff; font-size: 26rpx; }
.cardkey-value.active { color: #4ecdc4; }
.login-text { color: #ff6b6b; font-size: 32rpx; text-align: center; display: block; }
.stats { display: flex; margin-top: 16rpx; }
.stat-item { flex: 1; text-align: center; }
.stat-value { color: #fff; font-size: 36rpx; display: block; }
.stat-label { color: #888; font-size: 24rpx; }
.menu-section { margin-bottom: 24rpx; }
.section-title { color: #888; font-size: 26rpx; margin-bottom: 12rpx; display: block; }
.menu-list { background: #1a1a2e; border-radius: 16rpx; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #2d2d44; }
.menu-item:last-child { border-bottom: none; }
.menu-item text { color: #fff; font-size: 30rpx; }
.menu-item .arrow { color: #888; }
.logout-btn { margin-top: 48rpx; padding: 28rpx; background: #1a1a2e; border-radius: 16rpx; text-align: center; }
.logout-btn text { color: #ff6b6b; font-size: 30rpx; }
</style>
