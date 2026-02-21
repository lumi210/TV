<template>
  <view class="page">
    <view class="header">
      <text class="header-title">直播</text>
    </view>

    <view class="source-bar" v-if="sources.length > 0">
      <scroll-view scroll-x class="source-scroll">
        <view class="source-list">
          <view class="source-item" :class="{ active: currentSource === index }" v-for="(item, index) in sources" :key="index" @click="selectSource(index)">
            <text>{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="channel-list">
        <view class="channel-item" v-for="(item, index) in channels" :key="index" @click="playChannel(item)">
          <image class="channel-logo" :src="item.logo" mode="aspectFit" />
          <text class="channel-name">{{ item.name }}</text>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && channels.length === 0">
        <text>暂无直播频道</text>
      </view>
    </scroll-view>

    <view class="player-modal" v-if="playingChannel" @click="closePlayer">
      <view class="player-wrap" @click.stop>
        <video class="player-video" :src="playingChannel.url" autoplay controls />
        <view class="player-info">
          <text class="player-title">{{ playingChannel.name }}</text>
        </view>
        <view class="close-btn" @click="closePlayer">
          <text>X</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      sources: [],
      currentSource: 0,
      channels: [],
      playingChannel: null
    }
  },
  onShow() {
    this.loadSources()
  },
  methods: {
    loadSources() {
      uni.request({
        url: '/api/live/sources',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.sources) {
            this.sources = res.data.sources
            if (this.sources.length > 0) {
              this.loadChannels(this.sources[0].key)
            }
          }
        }
      })
    },
    loadChannels(sourceKey) {
      this.loading = true
      uni.request({
        url: '/api/live/channels?source=' + sourceKey,
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.data) {
            this.channels = res.data.data
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    selectSource(index) {
      this.currentSource = index
      this.loadChannels(this.sources[index].key)
    },
    playChannel(channel) {
      this.playingChannel = channel
    },
    closePlayer() {
      this.playingChannel = null
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: #1a1a2e;
}

.header-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.source-bar {
  background: #1a1a2e;
  padding: 16rpx 0;
}

.source-scroll {
  white-space: nowrap;
}

.source-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 12rpx;
}

.source-item {
  padding: 12rpx 24rpx;
  background: #0f0f1a;
  border-radius: 24rpx;
}

.source-item text {
  color: #888;
  font-size: 26rpx;
}

.source-item.active {
  background: #ff6b6b;
}

.source-item.active text {
  color: #fff;
}

.content {
  flex: 1;
}

.channel-list {
  padding: 0 24rpx;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.channel-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: #1a1a2e;
}

.channel-name {
  margin-left: 24rpx;
  color: #fff;
  font-size: 30rpx;
}

.loading, .empty {
  padding: 48rpx;
  text-align: center;
}

.loading text, .empty text {
  color: #888;
}

.player-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.player-wrap {
  width: 100%;
}

.player-video {
  width: 100%;
  height: 420rpx;
}

.player-info {
  padding: 24rpx;
  background: #1a1a2e;
}

.player-title {
  color: #fff;
  font-size: 32rpx;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn text {
  color: #fff;
  font-size: 28rpx;
}
</style>
