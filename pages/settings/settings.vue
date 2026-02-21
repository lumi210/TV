<template>
  <view class="page">
    <view class="header">
      <text class="back" @click="goBack">&lt;</text>
      <text class="header-title">设置</text>
    </view>
    <view class="content">
      <view class="item" v-if="userInfo" @click="logout">
        <text>退出登录</text>
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
    goBack() { uni.navigateBack() },
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
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; display: flex; align-items: center; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; }
.item { padding: 32rpx; background: #1a1a2e; margin: 24rpx; border-radius: 12rpx; }
.item text { color: #ff6b6b; font-size: 30rpx; }
</style>
