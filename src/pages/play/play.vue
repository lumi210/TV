<template>
  <view class="page">
    <view class="video-wrap">
      <view v-if="videoUrl" class="video-container">
        <video 
          id="video-player"
          class="video" 
          :src="videoUrl"
          :poster="poster" 
          controls 
          show-center-play-btn 
          enable-progress-gesture
          enable-play-gesture
          :autoplay="true"
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

      <!-- 测速进度 -->
      <view class="speed-test-progress" v-if="isSpeedTesting">
        <view class="speed-test-bar">
          <view class="speed-test-fill" :style="{ width: speedTestProgress + '%' }"></view>
        </view>
        <text class="speed-test-text">正在检测播放源速度... {{ speedTestProgress }}%</text>
      </view>

      <!-- Tab 切换 -->
      <view class="tab-container">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'episodes' }" 
          @click="activeTab = 'episodes'"
        >
          <text>选集</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'sources' }" 
          @click="activeTab = 'sources'"
        >
          <text>换源</text>
          <text class="source-count" v-if="availableSources.length > 1">({{ availableSources.length }})</text>
        </view>
      </view>

      <!-- 选集 Tab 内容 -->
      <view v-if="activeTab === 'episodes'" class="tab-content">
        <view class="episode-section" v-if="currentEpisodes.length > 0">
          <scroll-view scroll-x class="episode-scroll" enable-flex>
            <view class="episode-list">
              <view 
                class="episode-item" 
                :class="{ active: currentEpisode === index }" 
                v-for="(ep, index) in currentEpisodes" 
                :key="index" 
                @click="playEpisode(index)"
              >
                <text>{{ getEpisodeTitle(index) }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 换源 Tab 内容 -->
      <view v-if="activeTab === 'sources'" class="tab-content">
        <view class="source-list-vertical">
          <view 
            class="source-card" 
            :class="{ active: currentSourceIndex === index }" 
            v-for="(item, index) in availableSources" 
            :key="index" 
            @click="switchSource(index)"
          >
            <view class="source-card-main">
              <view class="source-card-info">
                <view class="source-card-name-row">
                  <text class="source-card-name">{{ item.source_name || ('源' + (index + 1)) }}</text>
                  <text class="source-speed-tag" v-if="item.speed">{{ item.speed }}ms</text>
                  <text class="source-quality-tag" v-if="item.quality">{{ item.quality }}</text>
                </view>
                <text class="source-card-eps" v-if="item.episodes && item.episodes.length > 0">共{{ item.episodes.length }}集</text>
              </view>
              <view class="source-card-status">
                <text class="status-tag playing" v-if="currentSourceIndex === index">播放中</text>
                <text class="status-tag" v-else>点击切换</text>
              </view>
            </view>
          </view>
        </view>

        <view class="source-tip" v-if="availableSources.length <= 1">
          <text>暂无其他播放源</text>
          <text class="tip-sub">当前仅找到一个可用播放源</text>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
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
      availableSources: [],
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
      isBuffering: false,
      loadingText: '加载中...',
      retryCount: 0,
      maxRetry: 3,
      activeTab: 'episodes',
      isSpeedTesting: false,
      speedTestProgress: 0,
      speedTestResults: {}
    }
  },
  computed: {
    currentSource() {
      return this.availableSources[this.currentSourceIndex] || null
    }
  },
  onLoad(options) {
    this.title = decodeURIComponent(options.title || '播放')
    
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
  },
  onShow() {
    this.checkFavorite()
  },
  onUnload() {
    this.savePlayRecord()
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
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
          episodes_titles: data.episodes_titles || [],
          originalData: data
        }]
        this.availableSources = [...this.allSources]
        this.currentEpisodes = data.episodes
        this.episodeTitles = data.episodes_titles || []
        this.playEpisode(0)
      }
      
      this.isLoading = false
      
      const searchTitle = data.title || data.name || data.search_title
      if (searchTitle) {
        this.searchAndTestSources(searchTitle)
      }
    },
    
    searchAndTestSources(keyword) {
      console.log('[Play] searchAndTestSources:', keyword)
      this.loadingMessage = '正在搜索播放源...'
      
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(keyword),
        withCredentials: true,
        success: (res) => {
          console.log('[Play] more sources response:', res.statusCode, res.data?.results?.length)
          if (res.statusCode === 200 && res.data && res.data.results && res.data.results.length > 0) {
            this.mergeSources(res.data.results)
            this.testAllSources()
          }
        },
        fail: (err) => {
          console.error('[Play] search more sources failed:', err)
        }
      })
    },
    
    mergeSources(results) {
      const existingKeys = new Set(this.allSources.map(s => s.source))
      
      results.forEach(item => {
        if (item.episodes && item.episodes.length > 0) {
          const key = item.source || item.source_name || 'unknown'
          if (!existingKeys.has(key)) {
            existingKeys.add(key)
            this.allSources.push({
              source: item.source,
              source_name: item.source_name || ('源' + (this.allSources.length + 1)),
              episodes: item.episodes,
              episodes_titles: item.episodes_titles || [],
              originalData: item
            })
          }
        }
      })
      
      console.log('[Play] merged allSources:', this.allSources.length)
    },
    
    async testAllSources() {
      if (this.allSources.length <= 1) return
      
      this.isSpeedTesting = true
      this.speedTestProgress = 0
      
      const results = []
      const total = this.allSources.length
      let tested = 0
      
      for (let i = 0; i < this.allSources.length; i++) {
        const source = this.allSources[i]
        const result = await this.testSourceSpeed(source)
        tested++
        this.speedTestProgress = Math.round((tested / total) * 100)
        
        if (result.available) {
          results.push({
            ...source,
            speed: result.speed,
            quality: result.quality,
            available: true
          })
        }
      }
      
      results.sort((a, b) => {
        if (!a.speed) return 1
        if (!b.speed) return -1
        return a.speed - b.speed
      })
      
      this.availableSources = results
      
      if (results.length > 0 && results[0].source !== this.allSources[this.currentSourceIndex]?.source) {
        const bestSource = results[0]
        const bestIndex = this.availableSources.findIndex(s => s.source === bestSource.source)
        if (bestIndex >= 0) {
          this.currentSourceIndex = bestIndex
          this.currentEpisodes = bestSource.episodes
          this.episodeTitles = bestSource.episodes_titles || []
          this.playEpisode(0)
          uni.showToast({ 
            title: '已切换到最快源: ' + bestSource.source_name, 
            icon: 'none' 
          })
        }
      }
      
      this.isSpeedTesting = false
      console.log('[Play] speed test done, available:', results.length)
    },
    
    testSourceSpeed(source) {
      return new Promise((resolve) => {
        if (!source.episodes || source.episodes.length === 0) {
          resolve({ available: false, speed: null, quality: null })
          return
        }
        
        const url = source.episodes[0]
        const startTime = Date.now()
        let resolved = false
        
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true
            resolve({ available: false, speed: null, quality: null })
          }
        }, 5000)
        
        uni.request({
          url: url,
          method: 'HEAD',
          timeout: 5000,
          success: (res) => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              const speed = Date.now() - startTime
              const available = res.statusCode >= 200 && res.statusCode < 400
              resolve({ 
                available, 
                speed: available ? speed : null,
                quality: this.detectQuality(res.header)
              })
            }
          },
          fail: () => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              resolve({ available: false, speed: null, quality: null })
            }
          }
        })
      })
    },
    
    detectQuality(headers) {
      if (!headers) return '未知'
      const contentType = headers['Content-Type'] || headers['content-type'] || ''
      if (contentType.includes('mp4')) return 'MP4'
      if (contentType.includes('m3u8')) return 'HLS'
      if (contentType.includes('mpd')) return 'DASH'
      return 'HLS'
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
    
    async processSearchResults(results) {
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
      
      if (this.allSources.length > 0) {
        await this.testAllSources()
        
        if (this.availableSources.length === 0) {
          this.availableSources = [this.allSources[0]]
          this.currentEpisodes = this.allSources[0].episodes
          this.episodeTitles = this.allSources[0].episodes_titles || []
          this.playEpisode(0)
        }
      } else {
        this.errorMessage = '未找到可播放源'
      }
      
      this.isLoading = false
    },
    
    switchSource(index) {
      if (this.currentSourceIndex === index) return
      
      console.log('[Play] switchSource:', index)
      this.savePlayRecord()
      
      this.currentSourceIndex = index
      const source = this.availableSources[index]
      if (source && source.episodes && source.episodes.length > 0) {
        this.currentEpisodes = source.episodes
        this.episodeTitles = source.episodes_titles || []
        this.currentEpisode = 0
        this.playEpisode(0)
        
        uni.showToast({ 
          title: '已切换到 ' + (source.source_name || ('源' + (index + 1))), 
          icon: 'none' 
        })
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
      
      this.videoUrl = url
      this.retryCount = 0
      this.errorMessage = ''
      this.isLoading = false
      
      this.checkFavorite()
    },
    
    onPlay() {
      console.log('[Play] onPlay')
      this.isBuffering = false
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
        this.isBuffering = true
        this.loadingText = '播放出错，正在重试...'
        setTimeout(() => {
          this.playEpisode(this.currentEpisode)
        }, 1000)
      } else {
        this.isBuffering = false
        this.errorMessage = '视频播放失败，请尝试其他源'
        
        if (this.availableSources.length > 1) {
          uni.showModal({
            title: '播放失败',
            content: '当前源播放失败，是否切换到其他播放源？',
            success: (res) => {
              if (res.confirm) {
                this.activeTab = 'sources'
              }
            }
          })
        }
      }
    },
    
    retryLoad() {
      console.log('[Play] retryLoad')
      this.errorMessage = ''
      this.retryCount = 0
      if (this.currentEpisode >= 0) {
        this.playEpisode(this.currentEpisode)
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

/* 测速进度 */
.speed-test-progress {
  padding: 24rpx;
  background: $color-bg-secondary;
}

.speed-test-bar {
  height: 8rpx;
  background: $color-bg;
  border-radius: 4rpx;
  overflow: hidden;
}

.speed-test-fill {
  height: 100%;
  background: $color-primary;
  transition: width 0.3s;
}

.speed-test-text {
  display: block;
  margin-top: 12rpx;
  color: $color-text-muted;
  font-size: 24rpx;
  text-align: center;
}

/* Tab 切换样式 */
.tab-container {
  display: flex;
  background: $color-bg-secondary;
  border-bottom: 1rpx solid $color-border;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  position: relative;
  
  text {
    color: $color-text-muted;
    font-size: 28rpx;
    font-weight: 500;
  }
  
  &.active {
    text {
      color: $color-primary;
      font-weight: bold;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background: $color-primary;
      border-radius: 2rpx;
    }
  }
}

.source-count {
  font-size: 22rpx;
  margin-left: 4rpx;
}

.tab-content {
  padding: 24rpx;
}

/* 选集样式 */
.episode-section {
  margin-bottom: 16rpx;
}

.episode-scroll {
  width: 100%;
}

.episode-list {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  padding-bottom: 8rpx;
}

.episode-item {
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
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
}

/* 换源列表样式 */
.source-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.source-card {
  background: $color-bg-secondary;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 2rpx solid transparent;
  
  &.active {
    border-color: $color-primary;
    background: rgba($color-primary, 0.1);
  }
}

.source-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-card-info {
  flex: 1;
}

.source-card-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.source-card-name {
  color: $color-text;
  font-size: 30rpx;
  font-weight: bold;
}

.source-speed-tag {
  font-size: 22rpx;
  color: $color-success;
  background: rgba($color-success, 0.15);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.source-quality-tag {
  font-size: 22rpx;
  color: $color-secondary;
  background: rgba($color-secondary, 0.15);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.source-card-eps {
  color: $color-text-muted;
  font-size: 24rpx;
  margin-top: 8rpx;
  display: block;
}

.source-card-status {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.status-tag {
  padding: 8rpx 16rpx;
  background: $color-bg;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: $color-text-muted;
  
  &.playing {
    background: rgba($color-primary, 0.2);
    color: $color-primary;
  }
}

.source-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  
  text {
    color: $color-text-muted;
    font-size: 28rpx;
  }
  
  .tip-sub {
    font-size: 24rpx;
    margin-top: 8rpx;
  }
}

.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
