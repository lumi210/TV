<template>
  <view class="page">
    <view class="header">
      <text class="header-title">短剧</text>
    </view>
    <view class="content">
      <view class="empty">
        <text>暂无短剧内容</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.header-title { color: #fff; font-size: 36rpx; font-weight: bold; }
.content { padding: 24rpx; }
.empty { padding: 100rpx; text-align: center; }
.empty text { color: #888; font-size: 28rpx; }
</style>
