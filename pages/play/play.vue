<template>
  <view class="page">
    <view class="video-container">
      <video 
        v-if="videoUrl"
        class="video-player"
        :src="videoUrl"
        :poster="poster"
        :initial-time="initialTime"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @error="onError"
        controls
        show-center-play-btn
        enable-progress-gesture
      />
      <view class="video-placeholder" v-else>
        <text class="loading-text" v-if="loading">加载中...</text>
        <text class="error-text" v-else>视频加载失败</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="info-section">
        <view class="title-bar">
          <text class="title">{{ videoInfo.name || videoInfo.title }}</text>
          <view class="actions">
            <view class="action-btn" @click="toggleFavorite">
              <text :class="['icon', { active: isFavorite }]">&#9829;</text>
              <text class="action-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
        </view>
        <view class="meta-info">
          <text class="score" v-if="videoInfo.score">{{ videoInfo.score }}分</text>
          <text class="year" v-if="videoInfo.year">{{ videoInfo.year }}</text>
        </view>
        <text class="desc" v-if="videoInfo.description">{{ videoInfo.description }}</text>
      </view>

      <view class="source-section" v-if="sourceList.length > 1">
        <view class="section-header">
          <text class="section-title">播放源</text>
        </view>
        <scroll-view scroll-x class="source-scroll">
          <view class="source-list">
            <view 
              class="source-item" 
              :class="{ active: currentSourceIndex === index }"
              v-for="(source, index) in sourceList" 
              :key="index"
              @click="switchSource(index)"
            >
              <text class="source-name">{{ source.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="episode-section" v-if="episodeList.length > 0">
        <view class="section-header">
          <text class="section-title">选集 (共{{ episodeList.length }}集)</text>
          <text class="episode-current" v-if="currentEpisode > 0">第{{ currentEpisode }}集</text>
        </view>
        <scroll-view scroll-x class="episode-scroll">
          <view class="episode-list">
            <view 
              class="episode-item" 
              :class="{ active: currentEpisode === index + 1 }"
              v-for="(ep, index) in episodeList" 
              :key="index"
              @click="playEpisode(index + 1)"
            >
              <text class="episode-num">{{ index + 1 }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { doubanApi, shortDramaApi, favoriteApi } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const videoId = ref('')
const videoType = ref('movie')
const videoUrl = ref('')
const poster = ref('')
const initialTime = ref(0)
const loading = ref(true)
const currentEpisode = ref(1)
const currentSourceIndex = ref(0)

const videoInfo = ref({})
const sourceList = ref([])
const episodeList = ref([])
const isFavorite = ref(false)

let saveTimer = null

const loadVideoInfo = async () => {
  loading.value = true
  try {
    let res
    
    if (videoType.value === 'shortdrama') {
      res = await shortDramaApi.getDetail(videoId.value)
      if (res.data) {
        videoInfo.value = res.data
        poster.value = res.data.cover || ''
        
        if (res.data.episodes && res.data.episodes.length > 0) {
          episodeList.value = res.data.episodes
          const ep = res.data.episodes[currentEpisode.value - 1] || res.data.episodes[0]
          if (ep && ep.url) {
            videoUrl.value = ep.url
          }
        } else if (res.data.url) {
          videoUrl.value = res.data.url
        }
      }
    } else {
      res = await doubanApi.getDetail(videoId.value, videoType.value)
      if (res.data) {
        videoInfo.value = res.data
        poster.value = res.data.cover || res.data.pic || ''
        
        if (res.data.episodes && res.data.episodes.length > 0) {
          episodeList.value = res.data.episodes
          const ep = res.data.episodes[currentEpisode.value - 1] || res.data.episodes[0]
          if (ep && ep.url) {
            videoUrl.value = ep.url
          }
        } else if (res.data.url) {
          videoUrl.value = res.data.url
        }
        
        if (res.data.sources && res.data.sources.length > 0) {
          sourceList.value = res.data.sources
          const source = res.data.sources[currentSourceIndex.value] || res.data.sources[0]
          if (source && source.url) {
            videoUrl.value = source.url
          }
        }
      }
    }
    
    if (userStore.isLoggedIn) {
      checkFavorite()
    }
  } catch (error) {
    console.error('加载视频信息失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchSource = (index) => {
  currentSourceIndex.value = index
  if (sourceList.value[index] && sourceList.value[index].url) {
    videoUrl.value = sourceList.value[index].url
  }
}

const playEpisode = (episode) => {
  if (currentEpisode.value === episode) return
  currentEpisode.value = episode
  
  if (episodeList.value[episode - 1]) {
    const ep = episodeList.value[episode - 1]
    if (ep.url) {
      videoUrl.value = ep.url
    }
  }
}

const onTimeUpdate = (e) => {
  if (!saveTimer && userStore.isLoggedIn) {
    saveTimer = setTimeout(() => {
      saveProgress(e.detail.currentTime)
      saveTimer = null
    }, 5000)
  }
}

const saveProgress = async (time) => {
  try {
    await favoriteApi.addFavorite({
      id: videoId.value,
      type: videoType.value,
      episode: currentEpisode.value,
      progress: time,
      title: videoInfo.value.name || videoInfo.value.title,
      cover: videoInfo.value.cover || videoInfo.value.pic
    })
  } catch (error) {
    console.error('保存播放记录失败:', error)
  }
}

const onEnded = () => {
  if (episodeList.value.length > currentEpisode.value) {
    uni.showModal({
      title: '播放完成',
      content: '是否播放下一集?',
      success: (res) => {
        if (res.confirm) {
          playEpisode(currentEpisode.value + 1)
        }
      }
    })
  }
}

const onError = (e) => {
  console.error('视频播放错误:', e)
  uni.showToast({ title: '视频加载失败', icon: 'none' })
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  
  try {
    if (isFavorite.value) {
      await favoriteApi.removeFavorite(videoId.value)
      isFavorite.value = false
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      await favoriteApi.addFavorite({
        id: videoId.value,
        type: videoType.value,
        title: videoInfo.value.name || videoInfo.value.title,
        cover: videoInfo.value.cover || videoInfo.value.pic
      })
      isFavorite.value = true
      uni.showToast({ title: '收藏成功', icon: 'none' })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const checkFavorite = async () => {
  try {
    const res = await favoriteApi.checkFavorite(videoId.value)
    isFavorite.value = res.data?.isFavorite || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  videoId.value = options.id || ''
  videoType.value = options.type || 'movie'
  currentEpisode.value = parseInt(options.episode) || 1
  
  uni.setNavigationBarTitle({
    title: decodeURIComponent(options.title || '播放')
  })
  
  loadVideoInfo()
})

onUnmounted(() => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
})
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1a;
}

.video-container {
  width: 100%;
  height: 422rpx;
  background-color: #000000;
}

.video-player {
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

.loading-text, .error-text {
  font-size: 28rpx;
  color: #888888;
}

.error-text {
  color: #ff6b6b;
}

.content {
  flex: 1;
}

.info-section {
  padding: 24rpx;
  background-color: #1a1a2e;
}

.title-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title {
  flex: 1;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1.4;
}

.actions {
  display: flex;
  margin-left: 24rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 40rpx;
  color: #888888;
  
  &.active {
    color: #ff6b6b;
  }
}

.action-text {
  font-size: 20rpx;
  color: #888888;
  margin-top: 4rpx;
}

.meta-info {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  gap: 16rpx;
}

.score {
  font-size: 28rpx;
  color: #f5a623;
  font-weight: bold;
}

.year {
  font-size: 24rpx;
  color: #888888;
}

.desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #aaaaaa;
  line-height: 1.6;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.episode-current {
  font-size: 24rpx;
  color: #ff6b6b;
}

.source-scroll, .episode-scroll {
  white-space: nowrap;
}

.source-list, .episode-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.source-item, .episode-item {
  padding: 12rpx 32rpx;
  background-color: #1a1a2e;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #888888;
  
  &.active {
    background-color: #ff6b6b;
    color: #ffffff;
  }
}

.episode-item {
  min-width: 72rpx;
  text-align: center;
}
</style>
