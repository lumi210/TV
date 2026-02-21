<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <view class="content">
      <view class="user-card" v-if="userInfo">
        <text class="username">{{ userInfo.username }}</text>
        <view class="stats" v-if="userStats">
          <view class="stat-item">
            <text class="stat-value">{{ userStats.playCount || 0 }}</text>
            <text class="stat-label">观看</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ userStats.favoriteCount || 0 }}</text>
            <text class="stat-label">收藏</text>
          </view>
          <view class="stat-item" v-if="userStats.points !== undefined">
            <text class="stat-value">{{ userStats.points }}</text>
            <text class="stat-label">积分</text>
          </view>
        </view>
      </view>
      <view class="user-card" v-else @click="goLogin">
        <text class="login-text">点击登录</text>
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

      <view class="menu-section" v-if="userInfo">
        <text class="section-title">会员中心</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/points/points')">
            <text>我的积分</text>
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
      userStats: null
    }
  },
  onShow() {
    this.userInfo = uni.getStorageSync('userInfo')
    if (this.userInfo) {
      this.loadUserStats()
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
          if (res.data) {
            this.userStats = res.data
          }
        }
      })
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
.username { color: #fff; font-size: 36rpx; font-weight: bold; }
.login-text { color: #ff6b6b; font-size: 32rpx; text-align: center; display: block; }
.stats { display: flex; margin-top: 24rpx; }
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
