<template>
  <view class="page">
    <view class="video-wrap">
      <video v-if="videoUrl" class="video" :src="videoUrl" :poster="poster" controls show-center-play-btn />
      <view class="video-placeholder" v-else>
        <text v-if="loading">加载中...</text>
        <text v-else>视频加载失败</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="info">
        <text class="title">{{ title }}</text>
        <view class="meta">
          <text class="rate" v-if="info.rate">{{ info.rate }}分</text>
          <text class="year" v-if="info.year">{{ info.year }}</text>
        </view>
        <text class="desc" v-if="info.desc">{{ info.desc }}</text>
      </view>

      <view class="episode-section" v-if="episodes.length > 0">
        <text class="section-title">选集</text>
        <scroll-view scroll-x class="episode-scroll">
          <view class="episode-list">
            <view class="episode-item" :class="{ active: currentEpisode === index }" v-for="(ep, index) in episodes" :key="index" @click="playEpisode(index)">
              <text>{{ index + 1 }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      type: 'movie',
      title: '',
      videoUrl: '',
      poster: '',
      loading: true,
      info: {},
      episodes: [],
      currentEpisode: 0
    }
  },
  onLoad(options) {
    this.id = options.id || ''
    this.type = options.type || 'movie'
    this.title = decodeURIComponent(options.title || '播放')
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      this.loading = true
      
      let url = '/api/detail?id=' + this.id
      if (this.type !== 'movie') {
        url += '&type=' + this.type
      }
      
      uni.request({
        url: url,
        withCredentials: true,
        success: (res) => {
          if (res.data) {
            this.info = res.data.info || res.data
            this.poster = res.data.pic || res.data.poster || ''
            
            if (res.data.episodes && res.data.episodes.length > 0) {
              this.episodes = res.data.episodes
              this.playEpisode(0)
            } else if (res.data.url) {
              this.videoUrl = res.data.url
            } else if (res.data.playUrl) {
              this.videoUrl = res.data.playUrl
            }
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    playEpisode(index) {
      this.currentEpisode = index
      if (this.episodes[index] && this.episodes[index].url) {
        this.videoUrl = this.episodes[index].url
      }
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

.video-wrap {
  width: 100%;
  height: 420rpx;
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
}

.video-placeholder text {
  color: #888;
  font-size: 28rpx;
}

.content {
  flex: 1;
}

.info {
  padding: 24rpx;
  background: #1a1a2e;
}

.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.meta {
  margin-top: 12rpx;
  display: flex;
  gap: 16rpx;
}

.rate {
  color: #f5a623;
  font-size: 28rpx;
}

.year {
  color: #888;
  font-size: 26rpx;
}

.desc {
  margin-top: 16rpx;
  color: #aaa;
  font-size: 26rpx;
  line-height: 1.6;
}

.episode-section {
  padding: 24rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.episode-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.episode-list {
  display: inline-flex;
  gap: 12rpx;
}

.episode-item {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  border-radius: 12rpx;
}

.episode-item text {
  color: #888;
  font-size: 26rpx;
}

.episode-item.active {
  background: #ff6b6b;
}

.episode-item.active text {
  color: #fff;
}
</style>
