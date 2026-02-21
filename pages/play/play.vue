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
          <text class="title">{{ videoInfo.title }}</text>
          <view class="actions">
            <view class="action-btn" @click="toggleFavorite">
              <text :class="['icon', { active: isFavorite }]">&#9829;</text>
              <text class="action-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
        </view>
        <view class="meta-info">
          <text class="rating" v-if="videoInfo.rating">{{ videoInfo.rating }}分</text>
          <text class="year">{{ videoInfo.year }}</text>
          <text class="type">{{ getTypeName(videoInfo.type) }}</text>
        </view>
        <view class="tags" v-if="videoInfo.tags && videoInfo.tags.length > 0">
          <text class="tag" v-for="(tag, index) in videoInfo.tags" :key="index">{{ tag }}</text>
        </view>
        <text class="desc" v-if="videoInfo.desc">{{ videoInfo.desc }}</text>
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

      <view class="actor-section" v-if="videoInfo.actors && videoInfo.actors.length > 0">
        <view class="section-header">
          <text class="section-title">演员</text>
        </view>
        <scroll-view scroll-x class="actor-scroll">
          <view class="actor-list">
            <view class="actor-item" v-for="(actor, index) in videoInfo.actors" :key="index">
              <image class="actor-avatar" :src="actor.avatar || '/static/default-avatar.png'" mode="aspectFill" />
              <text class="actor-name">{{ actor.name }}</text>
              <text class="actor-role" v-if="actor.role">{{ actor.role }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="recommend-section" v-if="recommendList.length > 0">
        <view class="section-header">
          <text class="section-title">推荐</text>
        </view>
        <view class="recommend-list">
          <view 
            class="recommend-item" 
            v-for="(item, index) in recommendList" 
            :key="index"
            @click="goDetail(item)"
          >
            <image class="recommend-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
            <text class="recommend-title">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { playApi, favoriteApi, doubanApi } from '../../api'
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
const recommendList = ref([])
const isFavorite = ref(false)

let saveTimer = null

const loadVideoInfo = async () => {
  loading.value = true
  try {
    const res = await playApi.getPlayInfo(videoId.value, currentEpisode.value)
    if (res.data) {
      videoInfo.value = res.data.info || {}
      sourceList.value = res.data.sources || []
      episodeList.value = res.data.episodes || []
      recommendList.value = res.data.recommends || []
      
      if (sourceList.value.length > 0) {
        const source = sourceList.value[currentSourceIndex.value] || sourceList.value[0]
        videoUrl.value = source.url
      }
      
      poster.value = videoInfo.value.cover || ''
      initialTime.value = res.data.progress || 0
      
      if (userStore.isLoggedIn) {
        checkFavorite()
      }
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
  if (sourceList.value[index]) {
    videoUrl.value = sourceList.value[index].url
  }
}

const playEpisode = (episode) => {
  if (currentEpisode.value === episode) return
  currentEpisode.value = episode
  loadVideoInfo()
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
    await playApi.savePlayRecord({
      id: videoId.value,
      type: videoType.value,
      episode: currentEpisode.value,
      progress: time,
      title: videoInfo.value.title,
      cover: videoInfo.value.cover
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
        title: videoInfo.value.title,
        cover: videoInfo.value.cover
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

const goDetail = (item) => {
  uni.redirectTo({ 
    url: `/pages/play/play?id=${item.id}&type=${item.type || 'movie'}&title=${encodeURIComponent(item.title)}` 
  })
}

const getTypeName = (type) => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    variety: '综艺',
    anime: '动漫',
    shortdrama: '短剧'
  }
  return typeMap[type] || '影视'
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

.rating {
  font-size: 28rpx;
  color: #f5a623;
  font-weight: bold;
}

.year, .type {
  font-size: 24rpx;
  color: #888888;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
  gap: 12rpx;
}

.tag {
  font-size: 22rpx;
  color: #4ecdc4;
  padding: 6rpx 16rpx;
  background-color: rgba(78, 205, 196, 0.2);
  border-radius: 8rpx;
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

.source-scroll, .episode-scroll, .actor-scroll {
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

.actor-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 24rpx;
}

.actor-item {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.actor-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #1a1a2e;
}

.actor-name {
  font-size: 24rpx;
  color: #ffffff;
  margin-top: 8rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.actor-role {
  font-size: 20rpx;
  color: #888888;
  text-align: center;
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
  gap: 16rpx;
}

.recommend-item {
  width: calc(33.33% - 12rpx);
}

.recommend-cover {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
}

.recommend-title {
  font-size: 24rpx;
  color: #ffffff;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>
