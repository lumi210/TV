<template>
  <view class="page">
    <view class="header">
      <text class="header-title">直播</text>
      <view class="header-actions">
        <view class="action-btn" @click="showSearch = true">
          <text class="search-icon">&#128269;</text>
        </view>
      </view>
    </view>

    <view class="search-bar" v-if="showSearch">
      <input 
        class="search-input" 
        v-model="searchKeyword" 
        placeholder="搜索频道..."
        @confirm="searchChannel"
      />
      <text class="cancel-btn" @click="closeSearch">取消</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="source-bar" v-if="sources.length > 0">
        <scroll-view scroll-x class="source-scroll">
          <view class="source-list">
            <view 
              class="source-item" 
              :class="{ active: currentSource === source.key }"
              v-for="(source, index) in sources" 
              :key="index"
              @click="selectSource(source.key)"
            >{{ source.name }}</view>
          </view>
        </scroll-view>
      </view>

      <view class="channel-list">
        <view 
          class="channel-item" 
          v-for="(channel, index) in filteredChannels" 
          :key="index"
          @click="playChannel(channel)"
        >
          <image class="channel-logo" :src="channel.logo || '/static/default-logo.png'" mode="aspectFit" />
          <view class="channel-info">
            <text class="channel-name">{{ channel.name }}</text>
          </view>
        </view>

        <view class="loading" v-if="loading">
          <text>加载中...</text>
        </view>

        <view class="empty" v-if="!loading && filteredChannels.length === 0">
          <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">暂无直播频道</text>
          <text class="empty-tip">请先配置直播源</text>
        </view>
      </view>
    </scroll-view>

    <view class="player-modal" v-if="playingChannel" @click="closePlayer">
      <view class="player-container" @click.stop>
        <video 
          class="player-video"
          :src="playingChannel.url"
          :poster="playingChannel.logo"
          autoplay
          controls
          show-center-play-btn
          @error="onPlayError"
        />
        <view class="player-info">
          <text class="player-title">{{ playingChannel.name }}</text>
        </view>
        <view class="close-btn" @click="closePlayer">
          <text>&#10005;</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { liveApi } from '../../api'

const loading = ref(false)
const showSearch = ref(false)
const searchKeyword = ref('')
const sources = ref([])
const currentSource = ref('')
const channelList = ref([])
const playingChannel = ref(null)

const filteredChannels = computed(() => {
  if (!searchKeyword.value) return channelList.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return channelList.value.filter(c => 
    c.name.toLowerCase().includes(keyword)
  )
})

const loadSources = async () => {
  try {
    const res = await liveApi.getSources()
    if (res.sources && res.sources.length > 0) {
      sources.value = res.sources
      currentSource.value = res.sources[0].key
      await loadChannels()
    }
  } catch (error) {
    console.error('加载直播源失败:', error)
  }
}

const loadChannels = async () => {
  if (!currentSource.value) return
  
  loading.value = true
  try {
    const res = await liveApi.getChannels(currentSource.value)
    if (res.data) {
      channelList.value = res.data.map(ch => ({
        name: ch.name,
        logo: ch.logo,
        url: ch.url,
        tvgId: ch.tvgId
      }))
    }
  } catch (error) {
    console.error('加载直播频道失败:', error)
  } finally {
    loading.value = false
  }
}

const selectSource = (key) => {
  currentSource.value = key
  loadChannels()
}

const searchChannel = () => {
}

const closeSearch = () => {
  showSearch.value = false
  searchKeyword.value = ''
}

const playChannel = (channel) => {
  playingChannel.value = channel
}

const closePlayer = () => {
  playingChannel.value = null
}

const onPlayError = () => {
  uni.showToast({ title: '播放失败', icon: 'none' })
}

onMounted(() => {
  loadSources()
})
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1a;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background-color: #1a1a2e;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-actions {
  display: flex;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 107, 0.2);
  border-radius: 50%;
}

.search-icon {
  font-size: 28rpx;
  color: #ff6b6b;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #1a1a2e;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background-color: #0f0f1a;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.cancel-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  margin-left: 24rpx;
}

.content {
  flex: 1;
}

.source-bar {
  background-color: #1a1a2e;
  border-bottom: 1rpx solid #2d2d44;
}

.source-scroll {
  white-space: nowrap;
}

.source-list {
  display: inline-flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.source-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #888888;
  background-color: #0f0f1a;
  border-radius: 24rpx;
  
  &.active {
    color: #ffffff;
    background-color: #ff6b6b;
  }
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
  background-color: #1a1a2e;
}

.channel-info {
  flex: 1;
  padding-left: 24rpx;
}

.channel-name {
  font-size: 30rpx;
  color: #ffffff;
  display: block;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #888888;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #888888;
  margin-bottom: 8rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #555555;
}

.player-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.player-container {
  width: 100%;
  position: relative;
}

.player-video {
  width: 100%;
  height: 422rpx;
}

.player-info {
  padding: 24rpx;
  background-color: #1a1a2e;
}

.player-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: #ffffff;
  font-size: 32rpx;
}
</style>
