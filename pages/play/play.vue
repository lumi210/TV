<template>
  <view class="page">
    <view class="header">
      <text class="back" @click="goBack">&lt;</text>
      <text class="header-title">播放</text>
    </view>
    <view class="content">
      <video v-if="videoUrl" class="video" :src="videoUrl" controls />
      <view class="info">
        <text class="title">{{ title }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      videoId: '',
      title: '',
      videoUrl: ''
    }
  },
  onLoad(options) {
    this.videoId = options.id || ''
    this.title = decodeURIComponent(options.title || '播放')
  },
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; display: flex; align-items: center; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; }
.video { width: 100%; height: 420rpx; }
.info { padding: 24rpx; }
.title { color: #fff; font-size: 32rpx; }
</style>
