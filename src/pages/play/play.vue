<template>
  <view class="page">
    <view class="video-wrap">
      <view v-if="videoUrl" class="video-container" id="video-container">
        <video 
          id="video-player"
          class="video" 
          :src="!useHls ? videoUrl : ''"
          :poster="poster" 
          controls 
          show-center-play-btn 
          enable-progress-gesture
          enable-play-gesture
          :autoplay="autoplay"
          :initial-time="resumeTime"
          @play="onPlay"
          @pause="onPause"
          @error="onVideoError"
          @timeupdate="onTimeUpdate" 
          @ended="onEnded"
          @waiting="onWaiting"
          @playing="onPlaying"
          x5-video-player-type="h5"
          x5-video-player="true"
        />
        <view v-if="isBuffering" class="loading-overlay">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ loadingText }}</text>
        </view>
      </view>
      <view class="video-placeholder" v-else>
        <view v-if="isLoading" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ loadingMessage }}</text>
        </view>
        <view v-else-if="errorMessage" class="error-state">
          <text class="error-icon">&#9888;</text>
          <text class="error-text">{{ errorMessage }}</text>
          <view class="retry-btn" @click="retryLoad">
            <text>重试</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <text>暂无视频</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="info">
        <view class="title-row">
          <text class="title">{{ title }}</text>
          <view class="action-btns">
            <view class="action-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
              <text class="action-icon">{{ isFavorited ? '&#9829;' : '&#9825;' }}</text>
              <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
        </view>
        <view class="meta">
          <text class="year" v-if="info.year">{{ info.year }}</text>
          <text class="type-name" v-if="info.type_name">{{ info.type_name }}</text>
          <text class="rate" v-if="info.rate">{{ info.rate }}分</text>
          <text class="source-badge" v-if="currentSource">{{ currentSource.source_name }}</text>
        </view>
        <text class="desc" v-if="info.desc">{{ info.desc }}</text>
      </view>

      <view class="source-section" v-if="allSources.length > 1">
        <view class="section-header">
          <text class="section-title">播放源 ({{ allSources.length }}个)</text>
          <view class="source-speed-test" v-if="speedTestResults.length > 0">
            <text class="speed-info">已测速</text>
          </view>
        </view>
        <scroll-view scroll-x class="source-scroll" enable-flex>
          <view class="source-list">
            <view 
              class="source-item" 
              :class="{ active: currentSourceIndex === index }" 
              v-for="(item, index) in allSources" 
              :key="index" 
              @click="switchSource(index)"
            >
              <text class="source-name">{{ item.source_name || ('源' + (index + 1)) }}</text>
              <text class="source-eps" v-if="item.episodes && item.episodes.length > 0">{{ item.episodes.length }}集</text>
              <text class="source-speed" v-if="speedTestResults[index]">{{ speedTestResults[index] }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="episode-section" v-if="currentEpisodes.length > 0">
        <view class="episode-header">
          <text class="section-title">选集 (共{{ currentEpisodes.length }}集)</text>
          <text class="current-ep" v-if="currentEpisode >= 0">播放: 第{{ currentEpisode + 1 }}集</text>
        </view>
        <scroll-view scroll-x class="episode-scroll" enable-flex>
          <view class="episode-list">
            <view 
              class="episode-item" 
              :class="{ active: currentEpisode === index, watched: isWatched(index) }" 
              v-for="(ep, index) in currentEpisodes" 
              :key="index" 
              @click="playEpisode(index)"
            >
              <text>{{ getEpisodeTitle(index) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="other-sources-section" v-if="otherResults.length > 0">
        <text class="section-title">其他播放源 ({{ otherResults.length }}个)</text>
        <view class="other-list">
          <view 
            class="other-item" 
            v-for="(item, index) in otherResults" 
            :key="index" 
            @click="loadOtherSource(item)"
          >
            <image class="other-cover" :src="getPoster(item)" mode="aspectFill" lazy-load />
            <view class="other-info">
              <text class="other-title">{{ item.title }}</text>
              <text class="other-source-name">{{ item.source_name }}</text>
              <text class="other-eps" v-if="item.episodes && item.episodes.length > 0">共{{ item.episodes.length }}集</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
import Hls from 'hls.js'

export default {
  data() {
    return {
      id: '',
      type: '',
      title: '',
      videoUrl: '',
      poster: '',
      isLoading: true,
      loadingMessage: '正在加载...',
      errorMessage: '',
      info: {},
      allSources: [],
      otherResults: [],
      currentSourceIndex: 0,
      currentEpisodes: [],
      currentEpisode: -1,
      episodeTitles: [],
      currentTime: 0,
      duration: 0,
      saveTimer: null,
      isFavorited: false,
      searchKeyword: '',
      useHls: false,
      hlsInstance: null,
      autoplay: true,
      resumeTime: 0,
      isBuffering: false,
      loadingText: '加载中...',
      speedTestResults: [],
      watchedEpisodes: new Set(),
      retryCount: 0,
      maxRetry: 3
    }
  },
  computed: {
    currentSource() {
      return this.allSources[this.currentSourceIndex] || null
    }
  },
  onLoad(options) {
    this.title = decodeURIComponent(options.title || '播放')
    
    if (options.time) {
      this.resumeTime = parseInt(options.time) || 0
    }
    
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data))
        this.initWithData(data)
      } catch (e) {
        console.error('[Play] parse data error:', e)
        this.errorMessage = '数据解析失败'
        this.isLoading = false
      }
    }
    
    if (options.q) {
      this.searchKeyword = decodeURIComponent(options.q)
      this.searchAndLoad(this.searchKeyword)
    }
    
    this.loadWatchedHistory()
  },
  onShow() {
    this.checkFavorite()
  },
  onUnload() {
    this.savePlayRecord()
    this.saveWatchedHistory()
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    this.destroyHls()
  },
  onHide() {
    this.savePlayRecord()
  },
  methods: {
    initWithData(data) {
      console.log('[Play] initWithData:', data)
      this.id = data.id || data.vod_id || ''
      this.type = data.type || 'movie'
      this.poster = this.proxyImage(data.poster || data.pic || data.cover || '')
      
      this.info = {
        year: data.year,
        type_name: data.type_name,
        rate: data.rate || data.rating,
        desc: data.desc || data.description || data.note
      }
      
      if (data.episodes && data.episodes.length > 0) {
        this.allSources = [{
          source: data.source,
          source_name: data.source_name || '默认源',
          episodes: data.episodes,
          episodes_titles: data.episodes_titles || []
        }]
        this.currentEpisodes = data.episodes
        this.episodeTitles = data.episodes_titles || []
        
        const startEp = data.startEpisode || 0
        this.playEpisode(startEp)
      }
      
      this.isLoading = false
    },
    
    searchAndLoad(keyword) {
      console.log('[Play] searchAndLoad:', keyword)
      this.loadingMessage = '正在搜索播放源...'
      this.isLoading = true
      
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(keyword),
        withCredentials: true,
        success: (res) => {
          console.log('[Play] search response:', res.statusCode, res.data)
          if (res.statusCode === 200 && res.data && res.data.results && res.data.results.length > 0) {
            this.processSearchResults(res.data.results)
          } else {
            this.errorMessage = '未找到播放源'
            this.isLoading = false
          }
        },
        fail: (err) => {
          console.error('[Play] search failed:', err)
          this.errorMessage = '搜索失败，请检查网络'
          this.isLoading = false
        }
      })
    },
    
    processSearchResults(results) {
      console.log('[Play] processSearchResults:', results.length)
      if (!results || results.length === 0) {
        this.errorMessage = '未找到播放源'
        this.isLoading = false
        return
      }
      
      const first = results[0]
      this.id = first.id || first.vod_id || ''
      this.title = first.title || this.title
      this.poster = this.proxyImage(first.poster || first.pic || first.cover || '')
      this.info = {
        year: first.year,
        type_name: first.type_name,
        rate: first.rate || first.rating,
        desc: first.desc || first.description || first.note
      }
      
      const sourcesMap = new Map()
      
      results.forEach(item => {
        if (item.episodes && item.episodes.length > 0) {
          const key = item.source || item.source_name || 'unknown'
          if (!sourcesMap.has(key)) {
            sourcesMap.set(key, {
              source: item.source,
              source_name: item.source_name || ('源' + (sourcesMap.size + 1)),
              episodes: item.episodes,
              episodes_titles: item.episodes_titles || [],
              originalData: item
            })
          }
        }
      })
      
      this.allSources = Array.from(sourcesMap.values())
      console.log('[Play] allSources:', this.allSources.length)
      
      this.otherResults = results.filter(item => {
        return !item.episodes || item.episodes.length === 0
      })
      
      if (this.allSources.length > 0) {
        this.currentSourceIndex = 0
        this.currentEpisodes = this.allSources[0].episodes
        this.episodeTitles = this.allSources[0].episodes_titles || []
        this.playEpisode(0)
      } else {
        this.errorMessage = '未找到可播放源'
        this.isLoading = false
      }
    },
    
    switchSource(index) {
      if (this.currentSourceIndex === index) return
      
      console.log('[Play] switchSource:', index)
      this.savePlayRecord()
      this.destroyHls()
      
      this.currentSourceIndex = index
      const source = this.allSources[index]
      if (source && source.episodes && source.episodes.length > 0) {
        this.currentEpisodes = source.episodes
        this.episodeTitles = source.episodes_titles || []
        this.playEpisode(0)
      }
    },
    
    loadOtherSource(item) {
      console.log('[Play] loadOtherSource:', item.source_name)
      if (item.episodes && item.episodes.length > 0) {
        this.allSources.push({
          source: item.source,
          source_name: item.source_name || '新源',
          episodes: item.episodes,
          episodes_titles: item.episodes_titles || [],
          originalData: item
        })
        this.switchSource(this.allSources.length - 1)
      }
    },
    
    playEpisode(index) {
      console.log('[Play] playEpisode:', index)
      this.currentEpisode = index
      
      if (!this.currentEpisodes[index]) {
        console.error('[Play] episode url not found')
        return
      }
      
      let url = this.currentEpisodes[index]
      if (typeof url !== 'string') {
        console.error('[Play] invalid episode url:', url)
        return
      }
      
      if (url.includes('.m3u8') && !url.includes('://')) {
        url = 'https:' + url
      }
      
      console.log('[Play] video url:', url)
      
      this.destroyHls()
      this.videoUrl = url
      this.useHls = false
      this.retryCount = 0
      this.errorMessage = ''
      
      const isHlsVideo = url.includes('.m3u8')
      
      if (isHlsVideo && typeof document !== 'undefined') {
        this.$nextTick(() => {
          if (Hls && Hls.isSupported()) {
            this.initHlsPlayer(url)
          } else {
            console.log('[Play] HLS not supported, use native')
            this.useHls = false
          }
          this.isLoading = false
        })
      } else {
        this.isLoading = false
      }
      
      this.checkFavorite()
    },
    
    initHlsPlayer(url) {
      console.log('[Play] initHlsPlayer:', url)
      
      const video = document.getElementById('video-player')
      if (!video) {
        console.error('[Play] video element not found')
        this.useHls = false
        return
      }
      
      const bufferConfig = this.getHlsBufferConfig()
      
      this.hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: bufferConfig.backBufferLength,
        maxBufferLength: bufferConfig.maxBufferLength,
        maxBufferSize: bufferConfig.maxBufferSize,
        maxMaxBufferLength: bufferConfig.maxBufferLength,
        startLevel: -1,
        autoStartLoad: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false
          xhr.timeout = 30000
        },
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 1000,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 1000
      })
      
      this.hlsInstance.loadSource(url)
      this.hlsInstance.attachMedia(video)
      
      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[Play] HLS manifest parsed')
        this.useHls = true
        this.isBuffering = false
        this.errorMessage = ''
        video.play().catch(e => {
          console.warn('[Play] autoplay failed:', e)
        })
      })
      
      this.hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
        this.isBuffering = false
      })
      
      this.hlsInstance.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, () => {
        console.warn('[Play] frag load emergency aborted')
      })
      
      this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.error('[Play] HLS error:', data.type, data.details, data)
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('[Play] Network error, trying to recover')
              this.loadingText = '网络错误，正在重试...'
              this.isBuffering = true
              if (this.retryCount < this.maxRetry) {
                this.retryCount++
                this.hlsInstance.startLoad()
              } else {
                this.showErrorMessage('网络错误，播放失败')
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[Play] Media error, trying to recover')
              this.hlsInstance.recoverMediaError()
              break
            default:
              console.error('[Play] Fatal error, cannot recover')
              this.showErrorMessage('播放失败，请尝试其他源')
              this.destroyHls()
              break
          }
        }
      })
    },
    
    getHlsBufferConfig() {
      return {
        maxBufferLength: 30,
        backBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000
      }
    },
    
    destroyHls() {
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
        this.useHls = false
      }
    },
    
    showErrorMessage(msg) {
      this.errorMessage = msg
      this.isBuffering = false
      uni.showToast({ title: msg, icon: 'none' })
    },
    
    retryLoad() {
      console.log('[Play] retryLoad')
      this.errorMessage = ''
      this.retryCount = 0
      if (this.currentEpisode >= 0) {
        this.playEpisode(this.currentEpisode)
      }
    },
    
    onPlay() {
      console.log('[Play] onPlay')
    },
    
    onPause() {
      console.log('[Play] onPause')
      this.savePlayRecord()
    },
    
    onWaiting() {
      this.isBuffering = true
      this.loadingText = '缓冲中...'
    },
    
    onPlaying() {
      this.isBuffering = false
      this.errorMessage = ''
    },
    
    onTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      this.duration = e.detail.duration
      
      if (Math.floor(this.currentTime) % 30 === 0 && Math.floor(this.currentTime) > 0) {
        if (!this.saveTimer) {
          this.savePlayRecord()
          this.saveTimer = setTimeout(() => {
            this.saveTimer = null
          }, 30000)
        }
      }
    },
    
    onEnded() {
      console.log('[Play] onEnded')
      this.savePlayRecord()
      this.markWatched(this.currentEpisode)
      
      if (this.currentEpisodes.length > this.currentEpisode + 1) {
        this.currentEpisode++
        setTimeout(() => {
          this.playEpisode(this.currentEpisode)
        }, 1500)
      }
    },
    
    onVideoError(e) {
      console.error('[Play] video error:', e)
      console.error('[Play] video url:', this.videoUrl)
      
      if (this.retryCount < this.maxRetry) {
        this.retryCount++
        this.loadingText = '播放出错，正在重试...'
        this.isBuffering = true
        setTimeout(() => {
          this.playEpisode(this.currentEpisode)
        }, 1000)
      } else {
        this.showErrorMessage('视频播放失败，请尝试其他源')
      }
    },
    
    getEpisodeTitle(index) {
      if (this.episodeTitles && this.episodeTitles[index]) {
        return this.episodeTitles[index]
      }
      if (this.currentEpisodes.length > 50) {
        return (index + 1)
      }
      return '第' + (index + 1) + '集'
    },
    
    isWatched(index) {
      const key = this.getWatchKey(index)
      return this.watchedEpisodes.has(key)
    },
    
    markWatched(index) {
      const key = this.getWatchKey(index)
      this.watchedEpisodes.add(key)
    },
    
    getWatchKey(index) {
      return `${this.id}_${this.currentSourceIndex}_${index}`
    },
    
    loadWatchedHistory() {
      try {
        const data = uni.getStorageSync('watched_history')
        if (data) {
          this.watchedEpisodes = new Set(JSON.parse(data))
        }
      } catch (e) {
        console.error('[Play] load watched history error:', e)
      }
    },
    
    saveWatchedHistory() {
      try {
        uni.setStorageSync('watched_history', JSON.stringify([...this.watchedEpisodes]))
      } catch (e) {
        console.error('[Play] save watched history error:', e)
      }
    },
    
    getPoster(item) {
      if (!item.poster && !item.cover && !item.pic) {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTQwIDIwMCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyMDAiLz48dGV4dCB4PSI3MCIgeT0iMTAwIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6DmtITlm77niYc8L3RleHQ+PC9zdmc+'
      }
      return this.proxyImage(item.poster || item.cover || item.pic)
    },
    
    proxyImage(url) {
      if (!url || url.startsWith('data:')) return url
      if (url.includes('doubanio.com') || url.includes('img9.doubanio.com') || url.includes('img2.doubanio.com')) {
        return '/api/image-proxy?url=' + encodeURIComponent(url)
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (!url.includes('monkeycode-ai.online') && !url.includes('localhost')) {
          return '/api/image-proxy?url=' + encodeURIComponent(url)
        }
      }
      return url
    },
    
    savePlayRecord() {
      if (!this.id && !this.title) return
      if (this.currentTime < 5) return
      
      const record = {
        key: (this.currentSource?.source || 'unknown') + '+' + (this.id || Date.now()),
        record: {
          title: this.title,
          source_name: this.currentSource?.source_name || '未知源',
          cover: this.poster,
          index: this.currentEpisode + 1,
          total_episodes: this.currentEpisodes.length,
          play_time: Math.floor(this.currentTime),
          duration: Math.floor(this.duration),
          save_time: Date.now(),
          url: this.videoUrl
        }
      }
      
      uni.request({
        url: '/api/playrecords',
        method: 'POST',
        data: record,
        withCredentials: true,
        success: () => {
          console.log('[Play] play record saved')
        },
        fail: (err) => {
          console.error('[Play] save play record failed:', err)
        }
      })
    },
    
    checkFavorite() {
      if (!this.id) return
      const source = this.currentSource?.source || 'unknown'
      const key = source + '+' + this.id
      uni.request({
        url: '/api/favorites?key=' + encodeURIComponent(key),
        withCredentials: true,
        success: (res) => {
          this.isFavorited = res.statusCode === 200 && res.data
        },
        fail: () => {
          this.isFavorited = false
        }
      })
    },
    
    toggleFavorite() {
      const source = this.currentSource?.source || 'unknown'
      const key = source + '+' + (this.id || Date.now())
      
      if (this.isFavorited) {
        uni.request({
          url: '/api/favorites?key=' + encodeURIComponent(key),
          method: 'DELETE',
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200) {
              this.isFavorited = false
              uni.showToast({ title: '已取消收藏', icon: 'success' })
            } else {
              uni.showToast({ title: res.data?.error || '操作失败', icon: 'none' })
            }
          },
          fail: () => {
            uni.showToast({ title: '操作失败', icon: 'none' })
          }
        })
      } else {
        const favorite = {
          videoId: this.id,
          title: this.title,
          source: this.currentSource?.source,
          source_name: this.currentSource?.source_name || '未知源',
          cover: this.poster,
          pic: this.poster,
          type: this.type || 'movie',
          year: this.info?.year,
          rate: this.info?.rate,
          episodes: this.currentEpisodes,
          episodes_titles: this.episodeTitles,
          save_time: Date.now()
        }
        uni.request({
          url: '/api/favorites',
          method: 'POST',
          data: { key, favorite },
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200) {
              this.isFavorited = true
              uni.showToast({ title: '收藏成功', icon: 'success' })
            } else {
              uni.showToast({ title: res.data?.error || '操作失败', icon: 'none' })
            }
          },
          fail: () => {
            uni.showToast({ title: '操作失败', icon: 'none' })
          }
        })
      }
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

.video-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  position: relative;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.video {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 26rpx;
  margin-top: 16rpx;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  text {
    color: $color-text-muted;
    font-size: 28rpx;
  }
}

.error-icon {
  font-size: 80rpx;
  color: $color-danger;
  margin-bottom: 16rpx;
}

.error-text {
  color: $color-text-muted;
  margin-bottom: 24rpx;
}

.retry-btn {
  padding: 16rpx 48rpx;
  background: $color-primary;
  border-radius: 24rpx;
  
  text {
    color: #fff;
    font-size: 28rpx;
  }
}

.content {
  flex: 1;
}

.info {
  padding: 24rpx;
  background: $color-bg-secondary;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
  flex: 1;
  margin-right: 16rpx;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  background: $color-bg;
  border-radius: 12rpx;
  
  &.active {
    background: rgba($color-primary, 0.2);
    
    .action-icon, .action-text {
      color: $color-primary;
    }
  }
}

.action-icon {
  font-size: 36rpx;
  color: $color-text-muted;
}

.action-text {
  font-size: 20rpx;
  color: $color-text-muted;
  margin-top: 4rpx;
}

.meta {
  margin-top: 12rpx;
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  align-items: center;
}

.year, .type-name {
  color: $color-text-muted;
  font-size: 26rpx;
}

.rate {
  color: $color-warning;
  font-size: 26rpx;
  font-weight: bold;
}

.source-badge {
  padding: 4rpx 12rpx;
  background: rgba($color-primary, 0.2);
  color: $color-primary;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.desc {
  margin-top: 16rpx;
  color: $color-text-secondary;
  font-size: 26rpx;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.source-section, .episode-section, .other-sources-section {
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  color: $color-text;
  font-size: 30rpx;
  font-weight: bold;
}

.speed-info {
  color: $color-success;
  font-size: 24rpx;
}

.episode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.current-ep {
  color: $color-secondary;
  font-size: 24rpx;
}

.source-scroll, .episode-scroll {
  width: 100%;
}

.source-list, .episode-list {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  padding-bottom: 8rpx;
}

.source-item, .episode-item {
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
  }
  
  &.active {
    background: $color-primary;
    
    text {
      color: #fff;
    }
  }
  
  &.watched {
    opacity: 0.6;
  }
}

.source-name {
  font-size: 26rpx;
}

.source-eps {
  font-size: 20rpx;
  margin-top: 4rpx;
}

.source-speed {
  font-size: 18rpx;
  color: $color-success;
  margin-top: 4rpx;
}

.other-list {
  margin-top: 16rpx;
}

.other-item {
  display: flex;
  padding: 16rpx;
  background: $color-bg-secondary;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.other-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.other-info {
  flex: 1;
  padding-left: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.other-title {
  color: $color-text;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.other-source-name {
  color: $color-secondary;
  font-size: 24rpx;
  margin-bottom: 4rpx;
}

.other-eps {
  color: $color-text-muted;
  font-size: 22rpx;
}

.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}

@media screen and (min-width: 768px) {
  .video-wrap {
    max-height: 420rpx;
  }
  
  .episode-list {
    flex-wrap: wrap;
  }
  
  .episode-item {
    flex-shrink: 1;
  }
}
</style>
