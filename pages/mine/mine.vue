<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>
    <view class="content">
      <view class="user-info" @click="goLogin">
        <text class="login-text">{{ userInfo ? userInfo.username : '点击登录' }}</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" v-if="userInfo" @click="logout">
          <text>退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { userInfo: null }
  },
  onShow() {
    this.userInfo = uni.getStorageSync('userInfo')
  },
  methods: {
    goLogin() {
      if (!this.userInfo) {
        uni.navigateTo({ url: '/pages/login/login' })
      }
    },
    logout() {
      uni.removeStorageSync('user_cookie')
      uni.removeStorageSync('userInfo')
      this.userInfo = null
      uni.showToast({ title: '已退出' })
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.header-title { color: #ff6b6b; font-size: 36rpx; font-weight: bold; }
.content { padding: 24rpx; }
.user-info { padding: 48rpx; background: #1a1a2e; border-radius: 16rpx; text-align: center; }
.login-text { color: #fff; font-size: 32rpx; }
.menu-item { padding: 32rpx; background: #1a1a2e; border-radius: 12rpx; margin-top: 16rpx; }
.menu-item text { color: #ff6b6b; font-size: 30rpx; }
</style>
