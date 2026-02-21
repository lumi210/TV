<template>
  <view class="page">
    <view class="header">
      <text class="back" @click="goBack">&lt;</text>
      <text class="header-title">收藏</text>
    </view>
    <view class="content">
      <view class="empty">
        <text>暂无收藏</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() { uni.navigateBack() }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; display: flex; align-items: center; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; }
.empty { padding: 100rpx; text-align: center; }
.empty text { color: #888; }
</style>
