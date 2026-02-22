<template>
  <view class="page">
    <view class="video-wrap">
      <view v-if="videoUrl" class="video" id="hls-video-container">
        <video 
          id="hls-video"
          class="video" 
          :src="!isHls ? videoUrl : ''"
          :poster="poster" 
          controls 
          show-center-play-btn 
          enable-progress-gesture
          enable-play-gesture
          :autoplay="true"
          @error="onVideoError"
          @timeupdate="onTimeUpdate" 
          @ended="onEnded"
          x5-video-player-type="h5"
          x5-video-player="true"
        />
      </view>
      <view class="video-placeholder" v-else>
        <text v-if="loading">加载中...</text>
        <text v-else>视频加载失败</text>
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
        </view>
        <text class="desc" v-if="info.desc">{{ info.desc }}</text>
      </view>

      <!-- 聚合的播放源列表 -->
      <view class="source-section" v-if="allSources.length > 0">
        <text class="section-title">播放源 ({{ allSources.length }}个)</text>
        <scroll-view scroll-x class="source-scroll" enable-flex>
          <view class="source-list">
            <view 
              class="source-item" 
              :class="{ active: currentSourceIndex === index }" 
              v-for="(item, index) in allSources" 
              :key="index" 
              @click="switchSource(index)"
            >
              <text class="source-name">{{ item.source_name || item.name || ('源' + (index + 1)) }}</text>
              <text class="source-eps" v-if="item.episodes && item.episodes.length > 0">{{ item.episodes.length }}集</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 当前源的集数 -->
      <view class="episode-section" v-if="currentEpisodes.length > 0">
        <view class="episode-header">
          <text class="section-title">选集 (共{{ currentEpisodes.length }}集)</text>
          <text class="current-source" v-if="currentSource">当前: {{ currentSource.source_name }}</text>
        </view>
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

      <!-- 其他搜索结果 -->
      <view class="other-sources-section" v-if="otherResults.length > 0">
        <text class="section-title">其他播放源 ({{ otherResults.length }}个)</text>
        <view class="other-list">
          <view 
            class="other-item" 
            v-for="(item, index) in otherResults" 
            :key="index" 
            @click="loadOtherSource(item)"
          >
            <image class="other-cover" :src="getPoster(item)" mode="aspectFill" />
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
      loading: true,
      info: {},
      allSources: [],
      otherResults: [],
      currentSourceIndex: 0,
      currentEpisodes: [],
      currentEpisode: 0,
      episodeTitles: [],
      currentTime: 0,
      duration: 0,
      saveTimer: null,
      isFavorited: false,
      searchKeyword: '',
      isHls: false,
      hlsInstance: null
    }
  },
  computed: {
    currentSource() {
      return this.allSources[this.currentSourceIndex] || null
    }
  },
  onLoad(options) {
    this.title = decodeURIComponent(options.title || '播放')
    
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data))
        this.initWithData(data)
      } catch (e) {
        console.error('parse data error:', e)
        this.loading = false
      }
    }
    
    if (options.q) {
      this.searchKeyword = decodeURIComponent(options.q)
      this.searchAndLoad(this.searchKeyword)
    }
    
    this.checkFavorite()
  },
  onUnload() {
    this.savePlayRecord()
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    if (this.hlsInstance) {
      this.hlsInstance.destroy()
      this.hlsInstance = null
    }
  },
  methods: {
    initWithData(data) {
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
        this.playEpisode(0)
      }
      
      this.loading = false
    },
    
    searchAndLoad(keyword) {
      console.log('[Play] searchAndLoad:', keyword)
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(keyword),
        withCredentials: true,
        success: (res) => {
          console.log('[Play] search response:', res.statusCode, res.data)
          if (res.statusCode === 200 && res.data && res.data.results && res.data.results.length > 0) {
            this.processSearchResults(res.data.results)
          } else {
            this.loading = false
            uni.showToast({ title: '未找到播放源', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('[Play] search failed:', err)
          this.loading = false
          uni.showToast({ title: '搜索失败', icon: 'none' })
        }
      })
    },
    
    processSearchResults(results) {
      console.log('[Play] search results:', results)
      if (!results || results.length === 0) {
        this.loading = false
        uni.showToast({ title: '未找到播放源', icon: 'none' })
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
      console.log('[Play] allSources:', this.allSources.length, this.allSources)
      
      if (this.allSources.length > 0) {
        this.currentSourceIndex = 0
        this.currentEpisodes = this.allSources[0].episodes
        this.episodeTitles = this.allSources[0].episodes_titles || []
        this.playEpisode(0)
      } else {
        uni.showToast({ title: '未找到可播放源', icon: 'none' })
      }
      
      this.otherResults = results.filter(item => {
        return !item.episodes || item.episodes.length === 0
      })
      
      this.loading = false
    },
    
    switchSource(index) {
      if (this.currentSourceIndex === index) return
      
      this.currentSourceIndex = index
      const source = this.allSources[index]
      if (source && source.episodes && source.episodes.length > 0) {
        this.currentEpisodes = source.episodes
        this.episodeTitles = source.episodes_titles || []
        this.playEpisode(0)
      }
    },
    
    loadOtherSource(item) {
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
      this.currentEpisode = index
      if (this.currentEpisodes[index]) {
        let url = this.currentEpisodes[index]
        if (url.includes('.m3u8') && !url.includes('://')) {
          url = 'https:' + url
        }
        console.log('[Play] original url:', url)
        
        const isHlsVideo = url.includes('.m3u8')
        
        this.videoUrl = url
        this.isHls = false
        
        if (isHlsVideo && Hls && Hls.isSupported() && typeof document !== 'undefined') {
          this.$nextTick(() => {
            this.initHlsPlayer(url)
          })
        }
      }
    },
    
    initHlsPlayer(url) {
      if (typeof document === 'undefined') return
      
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }
      
      const video = document.getElementById('hls-video')
      if (!video) {
        console.error('[Play] video element not found')
        return
      }
      
      this.hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false
        }
      })
      
      this.hlsInstance.loadSource(url)
      this.hlsInstance.attachMedia(video)
      
      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[Play] HLS manifest parsed, starting playback')
        this.isHls = true
        video.play().catch(e => console.warn('[Play] autoplay failed:', e))
      })
      
      this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.error('[Play] HLS error:', data.type, data.details, data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('[Play] Network error, trying to recover')
              this.hlsInstance.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[Play] Media error, trying to recover')
              this.hlsInstance.recoverMediaError()
              break
            default:
              console.error('[Play] Fatal error, fallback to native')
              this.hlsInstance.destroy()
              this.hlsInstance = null
              this.isHls = false
              break
          }
        }
      })
    },
    
    getProxyUrl(url) {
      if (!url) return ''
      return url
    },
    
    getEpisodeTitle(index) {
      if (this.episodeTitles && this.episodeTitles[index]) {
        return this.episodeTitles[index]
      }
      return '第' + (index + 1) + '集'
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
    
    onTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      this.duration = e.detail.duration
      
      if (!this.saveTimer && Math.floor(this.currentTime) % 30 === 0) {
        this.savePlayRecord()
        this.saveTimer = setTimeout(() => {
          this.saveTimer = null
        }, 30000)
      }
    },
    
    onEnded() {
      this.savePlayRecord()
      
      if (this.currentEpisodes.length > this.currentEpisode + 1) {
        setTimeout(() => {
          this.playEpisode(this.currentEpisode + 1)
        }, 2000)
      }
    },
    
    onVideoError(e) {
      console.error('[Play] video error:', e)
      console.error('[Play] video url:', this.videoUrl)
      uni.showToast({
        title: '视频播放失败',
        icon: 'none',
        duration: 2000
      })
    },
    
    savePlayRecord() {
      if (!this.id && !this.title) return
      
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
          console.log('播放记录已保存')
        },
        fail: (err) => {
          console.error('保存播放记录失败:', err)
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
          console.log('[Play] check favorite response:', res.statusCode, res.data)
          if (res.statusCode === 200 && res.data) {
            this.isFavorited = true
          } else {
            this.isFavorited = false
          }
        },
        fail: (err) => {
          console.error('[Play] check favorite failed:', err)
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
              console.error('取消收藏失败:', res.data)
              uni.showToast({ title: res.data?.error || '操作失败', icon: 'none' })
            }
          },
          fail: (err) => {
            console.error('取消收藏请求失败:', err)
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
              console.error('收藏失败:', res.data)
              uni.showToast({ title: res.data?.error || '操作失败', icon: 'none' })
            }
          },
          fail: (err) => {
            console.error('收藏请求失败:', err)
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
}

.video {
  width: 100%;
  height: 100%;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: $color-text-muted;
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
    
    .action-icon {
      color: $color-primary;
    }
    
    .action-text {
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

.section-title {
  color: $color-text;
  font-size: 30rpx;
  font-weight: bold;
}

.episode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.current-source {
  color: $color-secondary;
  font-size: 24rpx;
}

.source-scroll, .episode-scroll {
  margin-top: 16rpx;
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
      color: $color-text;
    }
  }
}

.source-name {
  font-size: 26rpx;
}

.source-eps {
  font-size: 20rpx;
  margin-top: 4rpx;
}

/* 其他源列表 */
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
