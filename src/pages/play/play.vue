<template>
  <view class="page">
    <view class="custom-navbar">
      <view class="navbar-back" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <text class="navbar-title">{{ title || '播放' }}</text>
      <view class="navbar-placeholder"></view>
    </view>
    
    <view class="video-wrap">
      <view v-if="videoUrl || hlsUrl" class="video-container">
        <!-- #ifdef H5 -->
        <video 
          ref="videoPlayer"
          id="video-player"
          class="video" 
          :src="videoUrl"
          :poster="poster" 
          controls 
          show-center-play-btn 
          enable-progress-gesture
          enable-play-gesture
          :autoplay="false"
          direction="0"
          @play="onPlay"
          @pause="onPause"
          @error="onVideoError"
          @timeupdate="onTimeUpdate" 
          @ended="onEnded"
          @waiting="onWaiting"
          @playing="onPlaying"
          @fullscreenchange="onFullscreenChange"
          x5-video-player-type="h5"
          x5-video-player="true"
        />
        <!-- #endif -->
        
        <!-- #ifndef H5 -->
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
          direction="0"
          :enable-play-gesture="true"
          :page-gesture="false"
          :http-cache="true"
          @play="onPlay"
          @pause="onPause"
          @error="onVideoError"
          @timeupdate="onTimeUpdate" 
          @ended="onEnded"
          @waiting="onWaiting"
          @playing="onPlaying"
          @fullscreenchange="onFullscreenChange"
        />
        <!-- #endif -->
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
import { buildUrl } from '../../utils/request'
// #ifdef H5
import Hls from 'hls.js'
// #endif

export default {
  data() {
    return {
      id: '',
      type: '',
      title: '',
      videoUrl: '',
      hlsUrl: '',
      poster: '',
      originalPoster: '',
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
      speedTestResults: {},
      useProxy: false,
      hlsInstance: null
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
    } else if (options.id && options.type === 'shortdrama') {
      this.loadShortDramaDetail(options.id, options.title)
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
    this.destroyHls()
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
  },
  onHide() {
    this.savePlayRecord()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async loadShortDramaDetail(id, title) {
      console.log('[Play] loadShortDramaDetail:', id, title)
      this.loadingMessage = '正在加载短剧详情...'
      this.isLoading = true
      
      try {
        const result = await this.fetchShortDramaFromMainApi(id, title || '')
        
        if (result && result.episodes && result.episodes.length > 0) {
          const data = {
            id: id,
            title: title,
            poster: result.cover || '',
            episodes: result.episodes,
            episodes_titles: result.episodes_titles || [],
            source: 'shortdrama',
            source_name: '短剧',
            type: 'shortdrama',
            desc: result.description || '',
            type_name: '短剧',
            drama_name: title
          }
          this.initWithData(data)
        } else {
          this.errorMessage = result?.msg || '获取短剧详情失败'
          this.isLoading = false
        }
      } catch (err) {
        console.error('[Play] load shortdrama detail failed:', err)
        this.errorMessage = '网络请求失败'
        this.isLoading = false
      }
    },
    
    fetchShortDramaFromMainApi(id, dramaName) {
      return new Promise((resolve) => {
        uni.request({
          url: buildUrl('/api/shortdrama/detail?id=' + id),
          withCredentials: true,
          success: (res) => {
            console.log('[Play] detail api response:', res.statusCode, JSON.stringify(res.data || {}).substring(0, 500))
            if (res.statusCode === 200 && res.data && res.data.episodes && res.data.episodes.length > 0) {
              resolve({
                totalEpisodes: res.data.episodes.length,
                episodes: res.data.episodes,
                episodes_titles: res.data.episodes_titles || [],
                cover: res.data.poster || '',
                description: res.data.desc || '',
                videoName: res.data.title || dramaName
              })
            } else {
              this.fetchShortDramaFromRemoteApi(id, dramaName).then(resolve)
            }
          },
          fail: (err) => {
            console.error('[Play] fetch from detail api failed:', err)
            this.fetchShortDramaFromRemoteApi(id, dramaName).then(resolve)
          }
        })
      })
    },
    
    fetchShortDramaFromRemoteApi(id, dramaName) {
      return new Promise((resolve) => {
        const apiUrl = buildUrl('/shortdrama-api?ac=videolist&ids=' + id)
        console.log('[Play] fetching from remote api:', apiUrl)
        
        uni.request({
          url: apiUrl,
          success: (res) => {
            console.log('[Play] remote api response:', res.statusCode, JSON.stringify(res.data || {}).substring(0, 500))
            if (res.statusCode === 200 && res.data && res.data.list && res.data.list.length > 0) {
              const item = res.data.list[0]
              const playUrl = item.vod_play_url || ''
              
              if (playUrl) {
                const episodeParts = playUrl.split('#')
                const episodes = []
                const episodes_titles = []
                
                episodeParts.forEach((part, index) => {
                  const parts = part.split('$')
                  if (parts.length >= 2) {
                    episodes_titles.push(parts[0])
                    episodes.push(parts[1])
                  } else if (parts.length === 1 && (parts[0].includes('.m3u8') || parts[0].includes('.mp4'))) {
                    episodes_titles.push('第' + (index + 1) + '集')
                    episodes.push(parts[0])
                  }
                })
                
                resolve({
                  totalEpisodes: episodes.length,
                  episodes: episodes,
                  episodes_titles: episodes_titles,
                  cover: item.vod_pic || '',
                  description: item.vod_content || item.vod_blurb || '',
                  videoName: item.vod_name || dramaName
                })
              } else {
                resolve({ msg: '未找到播放地址', episodes: [] })
              }
            } else {
              resolve({ msg: '获取视频信息失败', episodes: [] })
            }
          },
          fail: (err) => {
            console.error('[Play] fetch from remote api failed:', err)
            resolve({ msg: '网络请求失败', episodes: [] })
          }
        })
      })
    },
    
    initWithData(data) {
      console.log('[Play] initWithData:', data)
      this.id = data.id || data.vod_id || ''
      this.type = data.type || 'movie'
      this.title = this.title || data.title || data.name || data.search_title || ''
      this.originalPoster = data.poster || data.pic || data.cover || ''
      this.poster = this.proxyImage(this.originalPoster)
      
      this.info = {
        year: data.year,
        type_name: data.type_name,
        rate: data.rate || data.rating,
        desc: data.desc || data.description || data.note
      }
      console.log('[Play] initWithData info set:', this.info)
      
      if (data.episodes && data.episodes.length > 0) {
        this.allSources = [{
          source: data.source,
          source_name: data.source_name || '默认源',
          episodes: data.episodes,
          episodes_titles: data.episodes_titles || [],
          originalData: data
        }]
      }
      
      this.isLoading = false
      
      if (this.type === 'shortdrama' && this.allSources.length > 0) {
        this.availableSources = [...this.allSources]
        this.currentEpisodes = this.allSources[0].episodes
        this.episodeTitles = this.allSources[0].episodes_titles || []
        this.playEpisode(0)
        return
      }
      
      const searchTitle = data.title || data.name || data.search_title
      if (searchTitle) {
        this.searchAndTestSources(searchTitle)
      } else if (this.allSources.length > 0) {
        this.testAllSources()
      }
    },
    
    searchAndTestSources(keyword) {
      console.log('[Play] searchAndTestSources:', keyword)
      this.loadingMessage = '正在搜索播放源...'
      this.isLoading = true
      this.isSpeedTesting = true
      
      uni.request({
        url: buildUrl('/api/search?q=' + encodeURIComponent(keyword)),
        withCredentials: true,
        success: (res) => {
          console.log('[Play] more sources response:', res.statusCode, res.data?.results?.length)
          if (res.statusCode === 200 && res.data && res.data.results && res.data.results.length > 0) {
            this.mergeSources(res.data.results)
            this.testAllSources()
          } else {
            // 搜索无结果，测速现有源
            this.testAllSources()
          }
        },
        fail: (err) => {
          console.error('[Play] search more sources failed:', err)
          // 搜索失败，测速现有源
          this.testAllSources()
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
      if (this.allSources.length === 0) {
        this.errorMessage = '未找到播放源'
        this.isLoading = false
        this.isSpeedTesting = false
        return
      }
      
      this.availableSources = this.allSources.map((source, index) => ({
        ...source,
        speed: null,
        quality: null,
        available: true
      }))
      
      this.isSpeedTesting = true
      this.speedTestProgress = 0
      
      const total = this.allSources.length
      let tested = 0
      
      const testPromises = this.allSources.map((source, index) => {
        return this.testSourceSpeed(source).then(result => {
          tested++
          this.speedTestProgress = Math.round((tested / total) * 100)
          return { index, result }
        })
      })
      
      const testResults = await Promise.all(testPromises)
      
      const results = []
      testResults.forEach(({ index, result }) => {
        if (result.available) {
          results.push({
            ...this.allSources[index],
            speed: result.speed,
            quality: result.quality,
            available: true
          })
        }
      })
      
      results.sort((a, b) => {
        if (!a.speed) return 1
        if (!b.speed) return -1
        return a.speed - b.speed
      })
       
      this.isSpeedTesting = false
      this.isLoading = false
      console.log('[Play] speed test done, available:', results.length, 'total:', this.allSources.length)
      console.log('[Play] after speed test - title:', this.title, 'info:', this.info, 'poster:', this.poster)
      
      if (results.length > 0) {
        this.availableSources = results
      } else {
        this.availableSources = []
      }
      
      console.log('[Play] availableSources:', this.availableSources.length)
      
      if (this.availableSources.length > 0) {
        const bestSource = this.availableSources[0]
        this.currentSourceIndex = 0
        this.currentEpisodes = bestSource.episodes
        this.episodeTitles = bestSource.episodes_titles || []
        
        console.log('[Play] bestSource:', bestSource.source_name, 'episodes:', this.currentEpisodes.length)
        
        if (bestSource.speed) {
          uni.showToast({ 
            title: '已选择最快源: ' + bestSource.source_name + ' (' + bestSource.speed + 'ms)', 
            icon: 'none'
          })
        }
        
        this.playEpisode(0)
      } else {
        this.isLoading = false
        this.errorMessage = '所有播放源均不可用'
      }
    },
    
    testSourceSpeed(source) {
      return new Promise((resolve) => {
        if (!source.episodes || source.episodes.length === 0) {
          resolve({ available: false, speed: null, quality: null })
          return
        }
        
        let url = source.episodes[0]
        if (url.includes('.m3u8') && !url.includes('://')) {
          url = 'https:' + url
        }
        
        const testUrl = this.getTestUrl(url)
        const startTime = Date.now()
        let resolved = false
        
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true
            resolve({ available: false, speed: null, quality: null })
          }
        }, 5000)
        
        uni.request({
          url: testUrl,
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
              resolve({ available: true, speed: 9999, quality: 'HLS' })
            }
          }
        })
      })
    },
    
    getTestUrl(url) {
      if (!url || url.startsWith('data:')) return url
      
      if (url.includes('monkeycode-ai.online') || url.includes('localhost')) {
        return url
      }
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // #ifdef H5
        return buildUrl('/api/video-proxy?url=' + encodeURIComponent(url))
        // #endif
        
        // #ifndef H5
        return url
        // #endif
      }
      
      return url
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
        url: buildUrl('/api/search?q=' + encodeURIComponent(keyword)),
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
      
      // 只在没有设置时才更新 info，避免覆盖已有数据
      if (!this.id) {
        this.id = first.id || first.vod_id || ''
      }
      if (!this.originalPoster) {
        this.originalPoster = first.poster || first.pic || first.cover || ''
        this.poster = this.proxyImage(this.originalPoster)
      }
      if (!this.info || !this.info.year) {
        this.info = {
          year: first.year,
          type_name: first.type_name,
          rate: first.rate || first.rating,
          desc: first.desc || first.description || first.note
        }
      }
      console.log('[Play] processSearchResults info:', this.info)
      
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
          this.availableSources = [...this.allSources]
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
      
      if (url.startsWith('shortdrama:')) {
        this.playShortDramaEpisode(url)
        return
      }
      
      if (url.includes('.m3u8') && !url.includes('://')) {
        url = 'https:' + url
      }
      
      const originalUrl = url
      url = this.proxyVideoUrl(url)
      
      console.log('[Play] video url:', url)
      console.log('[Play] original url:', originalUrl)
      
      this.destroyHls()
      
      const isHls = originalUrl.includes('.m3u8')
      
      // #ifdef H5
      if (isHls && Hls.isSupported()) {
        this.hlsUrl = originalUrl
        this.videoUrl = ''
        this.$nextTick(() => {
          const video = document.getElementById('video-player')
          if (video) {
            this.hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            })
            this.hlsInstance.loadSource(url)
            this.hlsInstance.attachMedia(video)
            this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('[Play] HLS manifest parsed, starting playback')
              video.play().catch(e => console.warn('[Play] autoplay failed:', e))
            })
            this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
              console.error('[Play] HLS error:', data)
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('[Play] network error, trying to recover')
                    this.hlsInstance.startLoad()
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('[Play] media error, trying to recover')
                    this.hlsInstance.recoverMediaError()
                    break
                  default:
                    console.log('[Play] fatal error, cannot recover')
                    this.destroyHls()
                    this.onVideoError({ type: 'hls' })
                    break
                }
              }
            })
          }
        })
      } else {
        this.hlsUrl = ''
        this.videoUrl = url
      }
      // #endif
      
      // #ifndef H5
      this.hlsUrl = ''
      this.videoUrl = url
      // #endif
      
      this.retryCount = 0
      this.errorMessage = ''
      this.isLoading = false
      this.currentTime = 0
      this.duration = 0
      
      this.checkFavorite()
      
      this.savePlayRecord()
    },
    
    destroyHls() {
      // #ifdef H5
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }
      // #endif
    },
    
    proxyVideoUrl(url) {
      if (!url || url.startsWith('data:')) return url
      
      if (url.includes('monkeycode-ai.online') || url.includes('localhost')) {
        return url
      }
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // #ifdef H5
        return buildUrl('/api/video-proxy?url=' + encodeURIComponent(url))
        // #endif
        
        // #ifndef H5
        // App 端也尝试使用代理（部分视频源可能需要）
        if (this.useProxy) {
          return buildUrl('/api/video-proxy?url=' + encodeURIComponent(url))
        }
        return url
        // #endif
      }
      
      return url
    },
    
    playShortDramaEpisode(episodeUrl) {
      console.log('[Play] playShortDramaEpisode:', episodeUrl)
      console.log('[Play] this.id:', this.id, 'this.title:', this.title)
      this.isBuffering = true
      this.loadingText = '正在获取播放地址...'
      this.errorMessage = ''
      
      const parts = episodeUrl.split(':')
      console.log('[Play] episode parts:', parts)
      
      if (parts.length < 3) {
        this.errorMessage = '无效的短剧地址格式'
        this.isBuffering = false
        this.isLoading = false
        return
      }
      
      const id = parts[1]
      const episode = parseInt(parts[2])
      const dramaName = this.title || ''
      
      console.log('[Play] parse params - id:', id, 'episode:', episode, 'dramaName:', dramaName)
      
      this.tryParseShortDramaEpisode(id, episode, dramaName, 0)
    },
    
    tryParseShortDramaEpisode(id, episode, dramaName, retryCount) {
      const maxRetries = 3
      const apiUrl = buildUrl('/api/shortdrama/parse?id=' + id + '&episode=' + episode + '&proxy=true&name=' + encodeURIComponent(dramaName))
      console.log('[Play] request url:', apiUrl, 'retry:', retryCount)
      
      uni.request({
        url: apiUrl,
        withCredentials: true,
        success: (res) => {
          console.log('[Play] shortdrama parse response status:', res.statusCode)
          console.log('[Play] shortdrama parse response data:', JSON.stringify(res.data || {}))
          
          if (res.statusCode === 401) {
            this.isBuffering = false
            this.isLoading = false
            this.errorMessage = '请先登录'
            return
          }
          
          if (res.statusCode === 200 && res.data && !res.data.error) {
            const playUrl = res.data.url || res.data.proxyUrl
            if (playUrl) {
              this.videoUrl = playUrl
              this.errorMessage = ''
              this.retryCount = 0
              this.isBuffering = false
              this.isLoading = false
              this.currentTime = 0
              this.duration = 0
              console.log('[Play] got playUrl:', playUrl)
              this.savePlayRecord()
              return
            }
          }
          
          if (retryCount < maxRetries && episode < this.currentEpisodes.length) {
            console.log('[Play] parse failed, trying next episode:', episode + 1)
            this.currentEpisode = episode
            this.tryParseShortDramaEpisode(id, episode + 1, dramaName, retryCount + 1)
          } else {
            const errorMsg = res.data?.error || '获取播放地址失败'
            console.error('[Play] parse failed after retries:', errorMsg)
            this.isBuffering = false
            this.isLoading = false
            this.errorMessage = errorMsg
          }
        },
        fail: (err) => {
          console.error('[Play] get shortdrama play url failed:', err)
          if (retryCount < maxRetries && episode < this.currentEpisodes.length) {
            console.log('[Play] request failed, trying next episode:', episode + 1)
            this.currentEpisode = episode
            this.tryParseShortDramaEpisode(id, episode + 1, dramaName, retryCount + 1)
          } else {
            this.isBuffering = false
            this.isLoading = false
            this.errorMessage = '网络请求失败'
          }
        }
      })
    },
    
    onPlay() {
      console.log('[Play] onPlay')
      this.isBuffering = false
      // 播放开始时保存一次记录
      if (this.currentTime < 1) {
        this.savePlayRecord()
      }
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
    
    onFullscreenChange(e) {
      console.log('[Play] fullscreen change:', e.detail)
      const isFullscreen = e.detail.fullScreen || e.detail.direction === 'horizontal'
      
      if (isFullscreen) {
        if (typeof plus !== 'undefined' && plus.screen) {
          plus.screen.lockOrientation('landscape')
        }
        this.lockScreenOrientation('landscape')
      } else {
        if (typeof plus !== 'undefined' && plus.screen) {
          plus.screen.lockOrientation('portrait')
        }
        this.lockScreenOrientation('portrait')
      }
    },
    
    lockScreenOrientation(orientation) {
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
        if (orientation === 'landscape') {
          screen.orientation.lock('landscape').catch(() => {})
        } else {
          screen.orientation.lock('portrait').catch(() => {})
        }
      }
    },
    
    onTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      this.duration = e.detail.duration
      
      // 每隔30秒保存一次播放记录
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
        
        // #ifndef H5
        // App 端重试时切换代理模式
        if (this.retryCount === 1) {
          this.useProxy = false
          this.loadingText = '尝试直接播放...'
        } else if (this.retryCount === 2) {
          this.useProxy = true
          this.loadingText = '尝试代理播放...'
        } else {
          this.loadingText = '播放出错，正在重试(' + this.retryCount + '/' + this.maxRetry + ')...'
        }
        // #endif
        
        // #ifdef H5
        this.loadingText = '播放出错，正在重试(' + this.retryCount + '/' + this.maxRetry + ')...'
        // #endif
        
        setTimeout(() => {
          this.playEpisode(this.currentEpisode)
        }, 1000)
      } else {
        this.isBuffering = false
        this.isLoading = false
        this.useProxy = false
        
        if (this.availableSources.length > this.currentSourceIndex + 1) {
          uni.showModal({
            title: '播放失败',
            content: '当前源播放失败，是否自动切换到下一个播放源？',
            success: (res) => {
              if (res.confirm) {
                this.retryCount = 0
                this.errorMessage = ''
                this.switchSource(this.currentSourceIndex + 1)
              } else {
                this.errorMessage = '视频播放失败'
                this.activeTab = 'sources'
              }
            }
          })
        } else if (this.type === 'shortdrama' && this.currentEpisodes.length > this.currentEpisode + 1) {
          uni.showModal({
            title: '播放失败',
            content: '当前集播放失败，是否尝试播放下一集？',
            success: (res) => {
              if (res.confirm) {
                this.retryCount = 0
                this.errorMessage = ''
                this.playEpisode(this.currentEpisode + 1)
              } else {
                this.errorMessage = '视频播放失败'
                if (this.availableSources.length > 1) {
                  this.activeTab = 'sources'
                }
              }
            }
          })
        } else {
          this.errorMessage = '视频播放失败，请尝试其他播放源'
          if (this.availableSources.length > 1) {
            this.activeTab = 'sources'
          }
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
      
      // 使用图片代理
      if (url.includes('doubanio.com')) {
        return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (!url.includes('monkeycode-ai.online') && !url.includes('localhost')) {
          return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
        }
      }
      
      return url
    },
    
    savePlayRecord() {
      if (!this.id && !this.title) {
        console.warn('[Play] savePlayRecord skipped: no id and no title')
        return
      }
      
      if (!this.title) {
        console.warn('[Play] savePlayRecord skipped: no title')
        return
      }
      
      const source = this.currentSource?.source || 'unknown'
      const videoId = this.id || 'video_' + Date.now()
      const recordKey = source + '+' + videoId
      const episodeIndex = this.currentEpisode >= 0 ? this.currentEpisode + 1 : 1
      
      const record = {
        key: recordKey,
        record: {
          title: this.title,
          videoId: videoId,
          source_name: this.currentSource?.source_name || '未知源',
          source: source,
          cover: this.originalPoster || this.poster,
          year: this.info?.year || '',
          index: episodeIndex,
          total_episodes: this.currentEpisodes.length || 1,
          play_time: Math.floor(this.currentTime) || 0,
          total_time: Math.floor(this.duration) || 0,
          duration: Math.floor(this.duration) || 0,
          save_time: Date.now(),
          search_title: this.title
        }
      }
      
      console.log('[Play] saving play record:', recordKey, 'title:', this.title, 'index:', record.record.index)
      
      uni.request({
        url: buildUrl('/api/playrecords'),
        method: 'POST',
        data: record,
        withCredentials: true,
        success: (res) => {
          console.log('[Play] play record saved:', res.statusCode, res.data)
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
        url: buildUrl('/api/favorites?key=' + encodeURIComponent(key)),
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
          url: buildUrl('/api/favorites?key=' + encodeURIComponent(key)),
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
        const coverUrl = this.originalPoster || this.poster || ''
        console.log('[Play] saving favorite, cover:', coverUrl, 'originalPoster:', this.originalPoster)
        const favorite = {
          title: this.title,
          source_name: this.currentSource?.source_name || '未知源',
          cover: coverUrl,
          year: this.info?.year || '',
          total_episodes: this.currentEpisodes.length,
          save_time: Date.now(),
          search_title: this.title,
          type: this.type || 'movie'
        }
        uni.request({
          url: buildUrl('/api/favorites'),
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
  padding-top: 88rpx;
  box-sizing: border-box;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: $color-bg-secondary;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.navbar-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: $color-text;
  font-size: 40rpx;
  font-weight: bold;
}

.navbar-title {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-placeholder {
  width: 60rpx;
}

.video-wrap {
  width: 100%;
  height: 422rpx;
  background: #000;
  position: relative;
  flex-shrink: 0;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  min-height: 0;
  overflow-y: auto;
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
