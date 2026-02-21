<template>
  <view class="page">
    <view class="video-wrap">
      <video v-if="videoUrl" class="video" :src="videoUrl" :poster="poster" controls show-center-play-btn enable-progress-gesture @timeupdate="onTimeUpdate" @ended="onEnded" />
      <view class="video-placeholder" v-else>
        <text v-if="loading">加载中...</text>
        <text v-else>视频加载失败</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="info">
        <text class="title">{{ title }}</text>
        <view class="meta">
          <text class="year" v-if="info.year">{{ info.year }}</text>
          <text class="class" v-if="info.class">{{ info.class }}</text>
        </view>
        <text class="desc" v-if="info.desc">{{ info.desc }}</text>
      </view>

      <view class="source-section" v-if="sources.length > 0">
        <text class="section-title">播放源 ({{ sources.length }}个)</text>
        <scroll-view scroll-x class="source-scroll">
          <view class="source-list">
            <view class="source-item" :class="{ active: currentSource === index }" v-for="(item, index) in sources" :key="index" @click="switchSource(index)">
              <text>{{ item.source_name || item.name || ('源' + (index + 1)) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="episode-section" v-if="episodes.length > 0">
        <text class="section-title">选集 (共{{ episodes.length }}集)</text>
        <scroll-view scroll-x class="episode-scroll">
          <view class="episode-list">
            <view class="episode-item" :class="{ active: currentEpisode === index }" v-for="(ep, index) in episodes" :key="index" @click="playEpisode(index)">
              <text>{{ episodeTitles[index] || (index + 1) }}</text>
            </view>
          </view>
        </scroll-view>
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
      loading: true,
      info: {},
      sources: [],
      episodes: [],
      episodeTitles: [],
      currentSource: 0,
      currentEpisode: 0,
      currentTime: 0,
      duration: 0,
      saveTimer: null
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
  },
  onUnload() {
    this.savePlayRecord()
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
  },
  methods: {
    initWithData(data) {
      this.id = data.id || data.vod_id || ''
      this.type = data.type || 'movie'
      
      this.info = {
        year: data.year,
        class: data.class,
        desc: data.desc || data.description
      }
      this.poster = data.poster || data.pic || data.cover || ''
      
      if (data.episodes && data.episodes.length > 0) {
        this.episodes = data.episodes
        this.episodeTitles = data.episodes_titles || []
        this.sources = data.source ? [{ 
          source: data.source, 
          source_name: data.source_name,
          episodes: data.episodes 
        }] : []
        this.playEpisode(0)
      }
      
      this.loading = false
    },
    switchSource(index) {
      this.currentSource = index
      const source = this.sources[index]
      if (source && source.episodes && source.episodes.length > 0) {
        this.episodes = source.episodes
        this.episodeTitles = source.episodes_titles || []
        this.playEpisode(0)
      }
    },
    playEpisode(index) {
      this.currentEpisode = index
      if (this.episodes[index]) {
        this.videoUrl = this.episodes[index]
      }
    },
    onTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      this.duration = e.detail.duration
      
      // 每30秒保存一次
      if (!this.saveTimer && Math.floor(this.currentTime) % 30 === 0) {
        this.savePlayRecord()
        this.saveTimer = setTimeout(() => {
          this.saveTimer = null
        }, 30000)
      }
    },
    onEnded() {
      this.savePlayRecord()
      
      // 自动播放下一集
      if (this.episodes.length > this.currentEpisode + 1) {
        setTimeout(() => {
          this.playEpisode(this.currentEpisode + 1)
        }, 2000)
      }
    },
    savePlayRecord() {
      if (!this.id || !this.title) return
      
      const record = {
        videoId: this.id,
        type: this.type,
        title: this.title,
        cover: this.poster,
        episode: this.currentEpisode + 1,
        progress: Math.floor(this.currentTime),
        duration: Math.floor(this.duration),
        updateTime: Date.now()
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

.title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.meta {
  margin-top: 12rpx;
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.year {
  color: $color-text-muted;
  font-size: 26rpx;
}

.class {
  color: $color-secondary;
  font-size: 24rpx;
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

.source-section, .episode-section {
  padding: 24rpx;
}

.section-title {
  color: $color-text;
  font-size: 30rpx;
  font-weight: bold;
}

.source-scroll, .episode-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.source-list, .episode-list {
  display: flex;
  gap: 12rpx;
}

.source-item, .episode-item {
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
  border-radius: 24rpx;
  flex-shrink: 0;
  
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

@media screen and (min-width: 768px) {
  .video-wrap {
    max-height: 420rpx;
  }
  
  .episode-list {
    flex-wrap: wrap;
    white-space: normal;
  }
  
  .episode-item {
    flex-shrink: 1;
  }
}
</style>
