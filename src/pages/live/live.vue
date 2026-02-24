<template>
  <view class="page">
    <view class="header">
      <text class="header-title">直播</text>
    </view>

    <view class="source-bar" v-if="sources.length > 0">
      <scroll-view scroll-x class="source-scroll">
        <view class="source-list">
          <view class="source-item" :class="{ active: currentSource === index }" v-for="(item, index) in sources" :key="index" @click="selectSource(index)">
            <text>{{ item.name || item.title }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="search-bar" v-if="channels.length > 0">
      <input class="search-input" :value="searchKeyword" @input="onSearchInput" placeholder="搜索频道..." />
      <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
        <text>X</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="channel-list">
        <view class="channel-item" v-for="(item, index) in displayChannels" :key="index" @click="playChannel(item)">
          <image class="channel-logo" :src="item.logo" mode="aspectFit" />
          <view class="channel-info">
            <text class="channel-name">{{ item.name }}</text>
            <text class="channel-group" v-if="item.group">{{ item.group }}</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && sources.length === 0">
        <text class="empty-icon">&#128250;</text>
        <text class="empty-text">暂无直播源</text>
        <text class="empty-tip">请在后台配置直播源</text>
      </view>

      <view class="empty" v-if="!loading && sources.length > 0 && channels.length === 0">
        <text class="empty-icon">&#128250;</text>
        <text class="empty-text">暂无直播频道</text>
        <text class="empty-tip">请检查直播源配置</text>
      </view>

      <view class="empty" v-if="!loading && searchKeyword && filteredChannels.length === 0">
        <text class="empty-icon">&#128269;</text>
        <text class="empty-text">未找到匹配的频道</text>
        <text class="empty-tip">试试其他关键词</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>

    <view class="player-modal" v-if="playingChannel" @click="closePlayer">
      <view class="player-wrap" @click.stop>
        <video 
          ref="liveVideo"
          id="live-video"
          class="player-video" 
          :src="videoSrc"
          autoplay 
          controls 
          show-center-play-btn
          enable-progress-gesture
          :muted="false"
          @error="onVideoError"
          @play="onVideoPlay"
          @pause="onVideoPause"
        />
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
import { buildUrl } from "../../utils/request"
import Hls from 'hls.js'

export default {
  data() {
    return {
      loading: false,
      sources: [],
      currentSource: 0,
      channels: [],
      playingChannel: null,
      searchKeyword: '',
      filteredChannels: [],
      hlsInstance: null,
      videoSrc: '',
      useProxy: true
    }
  },
  computed: {
    displayChannels() {
      if (this.searchKeyword) {
        return this.filteredChannels
      }
      return this.channels
    }
  },
  onShow() {
    this.loadSources()
  },
  methods: {
    loadSources() {
      this.loading = true
      this.sources = []
      this.channels = []
      uni.request({
        url: buildUrl('/api/live/sources'),
        withCredentials: true,
        success: (res) => {
          console.log('[Live] sources response:', JSON.stringify(res.data, null, 2))
          if (res.statusCode === 200 && res.data) {
            let sourceList = []
            if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
              sourceList = res.data.data
            } else if (res.data.sources && Array.isArray(res.data.sources)) {
              sourceList = res.data.sources
            } else if (Array.isArray(res.data)) {
              sourceList = res.data
            }
            this.sources = sourceList.filter(s => !s.disabled)
            console.log('[Live] parsed sources:', this.sources.length, this.sources.map(s => ({ key: s.key, name: s.name })))
            if (this.sources.length > 0) {
              const firstSource = this.sources[0]
              console.log('[Live] loading channels for source:', firstSource.key)
              this.loadChannels(firstSource.key)
            } else {
              this.loading = false
            }
          } else {
            console.log('[Live] no data or error:', res.statusCode, res.data)
            this.loading = false
          }
        },
        fail: (err) => {
          console.error('[Live] load sources failed:', err)
          this.loading = false
          uni.showToast({ title: '加载直播源失败', icon: 'none' })
        }
      })
    },
    loadChannels(sourceKey) {
      if (!sourceKey) {
        console.error('[Live] loadChannels: sourceKey is empty')
        this.loading = false
        return
      }
      this.loading = true
      this.channels = []
      console.log('[Live] requesting channels for sourceKey:', sourceKey)
      uni.request({
        url: buildUrl('/api/live/channels?source=') + encodeURIComponent(sourceKey),
        withCredentials: true,
        success: (res) => {
          console.log('[Live] channels response status:', res.statusCode)
          console.log('[Live] channels response:', res.data ? JSON.stringify(res.data).substring(0, 500) : 'null')
          if (res.statusCode === 200 && res.data) {
            let channelList = []
            if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
              channelList = res.data.data
            } else if (res.data.data && Array.isArray(res.data.data)) {
              channelList = res.data.data
            } else if (res.data.channels && Array.isArray(res.data.channels)) {
              channelList = res.data.channels
            } else if (res.data.list && Array.isArray(res.data.list)) {
              channelList = res.data.list
            } else if (Array.isArray(res.data)) {
              channelList = res.data
            }
            this.channels = this.parseChannels(channelList)
            console.log('[Live] parsed channels:', this.channels.length)
            if (this.channels.length > 0) {
              console.log('[Live] first channel:', this.channels[0])
            }
          } else {
            console.log('[Live] channels request failed or no data')
          }
        },
        fail: (err) => {
          console.error('[Live] load channels failed:', err)
          uni.showToast({ title: '加载频道失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    parseChannels(data) {
      return data.map(item => ({
        name: item.name || item.title || item.channelName || '未知频道',
        url: item.url || item.stream || item.playUrl || item.link || '',
        logo: item.logo || item.icon || item.pic || item.image || '',
        group: item.group || item.category || item.type || ''
      }))
    },
    selectSource(index) {
      this.currentSource = index
      this.searchKeyword = ''
      this.filteredChannels = []
      const source = this.sources[index]
      this.loadChannels(source.key || source.name || source.id)
    },
    playChannel(channel) {
      if (!channel.url) {
        uni.showToast({ title: '该频道暂无播放地址', icon: 'none' })
        return
      }
      this.playingChannel = channel
      this.$nextTick(() => {
        const url = this.proxyLiveUrl(channel.url)
        this.initPlayer(url)
      })
    },
    
    proxyLiveUrl(url) {
      if (!url || url.startsWith('data:')) return url
      
      if (url.includes('monkeycode-ai.online') || url.includes('localhost')) {
        return url
      }
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // #ifdef H5
        if (this.useProxy) {
          return buildUrl('/api/video-proxy?url=' + encodeURIComponent(url))
        }
        return url
        // #endif
        
        // #ifndef H5
        return url
        // #endif
      }
      
      return url
    },
    
    initPlayer(url) {
      this.destroyPlayer()
      
      const video = document.getElementById('live-video')
      if (!video) {
        console.error('[Live] video element not found')
        return
      }
      
      console.log('[Live] init player with url:', url)
      
      const isHls = url.includes('.m3u8') || url.includes('m3u8')
      
      if (isHls && Hls.isSupported()) {
        this.videoSrc = ''
        this.hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })
        this.hlsInstance.loadSource(url)
        this.hlsInstance.attachMedia(video)
        this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('[Live] HLS manifest parsed, starting playback')
          video.play().catch(e => console.warn('[Live] autoplay failed:', e))
        })
        this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.error('[Live] HLS error:', data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('[Live] network error, trying to recover')
                this.hlsInstance.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('[Live] media error, trying to recover')
                this.hlsInstance.recoverMediaError()
                break
              default:
                console.log('[Live] fatal error, destroying player')
                this.destroyPlayer()
                uni.showToast({ title: '播放失败', icon: 'none' })
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHls) {
        this.videoSrc = url
        this.$nextTick(() => {
          video.play().catch(e => console.warn('[Live] autoplay failed:', e))
        })
      } else {
        this.videoSrc = url
        this.$nextTick(() => {
          video.play().catch(e => console.warn('[Live] autoplay failed:', e))
        })
      }
    },
    
    destroyPlayer() {
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }
    },
    
    onVideoError(e) {
      console.error('[Live] video error:', e)
    },
    
    onVideoPlay() {
      console.log('[Live] video playing')
    },
    
    onVideoPause() {
      console.log('[Live] video paused')
    },
    
    closePlayer() {
      this.destroyPlayer()
      this.playingChannel = null
      this.videoSrc = ''
    },
    onSearchInput(e) {
      this.searchKeyword = e.detail.value.toLowerCase()
      if (this.searchKeyword) {
        this.filteredChannels = this.channels.filter(ch => 
          (ch.name && ch.name.toLowerCase().includes(this.searchKeyword)) ||
          (ch.group && ch.group.toLowerCase().includes(this.searchKeyword))
        )
      } else {
        this.filteredChannels = []
      }
    },
    clearSearch() {
      this.searchKeyword = ''
      this.filteredChannels = []
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/common.scss';

.page {
  height: 100vh;
  background: $color-bg;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $color-bg-secondary;
}

.header-title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
}

.source-bar {
  background: $color-bg-secondary;
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
  background: $color-bg;
  border-radius: 24rpx;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
  }
  
  &.active {
    background: $color-primary;
    
    text {
      color: $color-text;
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  background: $color-bg;
  border-radius: 32rpx;
  color: $color-text;
  font-size: 26rpx;
}

.clear-btn {
  width: 48rpx;
  height: 48rpx;
  background: $color-bg;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: $color-text-muted;
    font-size: 24rpx;
  }
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
  border-bottom: 1rpx solid $color-border;
}

.channel-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.channel-info {
  flex: 1;
  margin-left: 24rpx;
}

.channel-name {
  color: $color-text;
  font-size: 30rpx;
  display: block;
}

.channel-group {
  color: $color-text-muted;
  font-size: 24rpx;
  margin-top: 4rpx;
  display: block;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
    margin-top: 16rpx;
  }
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid $color-bg-tertiary;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 48rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.empty-tip {
  color: $color-text-muted;
  font-size: 26rpx;
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
  position: relative;
}

.player-video {
  width: 100%;
  height: 420rpx;
  background: #000;
}

.player-info {
  padding: 24rpx;
  background: $color-bg-secondary;
}

.player-title {
  color: $color-text;
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
  
  text {
    color: $color-text;
    font-size: 28rpx;
  }
}
</style>
