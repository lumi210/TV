<template>
  <view class="page">
    <view class="header">
      <view class="header-content">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="title">LunaTV</text>
      </view>
      <view class="header-actions">
        <view class="search-btn" @click="goSearch">
          <text>&#128269;</text>
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="content" 
      :refresher-enabled="true" 
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section" v-if="hotMovies.length > 0">
        <view class="section-header">
          <text class="section-title">热门电影</text>
          <text class="section-more" @click="goMore('movie')">更多 ></text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view 
              class="movie-card" 
              v-for="(item, index) in hotMovies" 
              :key="index"
              @click="goDetail(item, 'movie')"
            >
              <image class="movie-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <view class="movie-meta">
                  <text class="movie-rating" v-if="item.rate">{{ item.rate }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section" v-if="hotTvShows.length > 0">
        <view class="section-header">
          <text class="section-title">热门电视剧</text>
          <text class="section-more" @click="goMore('tv')">更多 ></text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view 
              class="movie-card" 
              v-for="(item, index) in hotTvShows" 
              :key="index"
              @click="goDetail(item, 'tv')"
            >
              <image class="movie-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <view class="movie-meta">
                  <text class="movie-rating" v-if="item.rate">{{ item.rate }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section" v-if="hotVariety.length > 0">
        <view class="section-header">
          <text class="section-title">热门综艺</text>
          <text class="section-more" @click="goMore('variety')">更多 ></text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view 
              class="movie-card" 
              v-for="(item, index) in hotVariety" 
              :key="index"
              @click="goDetail(item, 'tv')"
            >
              <image class="movie-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <view class="movie-meta">
                  <text class="movie-rating" v-if="item.rate">{{ item.rate }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section" v-if="shortDramas.length > 0">
        <view class="section-header">
          <text class="section-title">短剧推荐</text>
          <text class="section-more" @click="goTab('/pages/shortdrama/shortdrama')">更多 ></text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view 
              class="movie-card" 
              v-for="(item, index) in shortDramas" 
              :key="index"
              @click="goShortDramaDetail(item)"
            >
              <image class="movie-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.name || item.title }}</text>
                <view class="movie-meta">
                  <text class="movie-rating" v-if="item.score">{{ item.score }}</text>
                  <text class="movie-episodes" v-if="item.episode_count">{{ item.episode_count }}集</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && hotMovies.length === 0 && hotTvShows.length === 0">
        <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
        <text class="empty-text">暂无内容</text>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doubanApi, shortDramaApi } from '../../api'

const loading = ref(false)
const refreshing = ref(false)
const hotMovies = ref([])
const hotTvShows = ref([])
const hotVariety = ref([])
const shortDramas = ref([])

const loadHomeData = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const [moviesRes, tvRes, varietyRes, dramaRes] = await Promise.all([
      doubanApi.getMovies('热门', 0, 10).catch(() => null),
      doubanApi.getTvShows('热门', 0, 10).catch(() => null),
      doubanApi.getTvShows('综艺', 0, 10).catch(() => null),
      shortDramaApi.getList(1, 10).catch(() => null)
    ])
    
    if (moviesRes && moviesRes.subjects) {
      hotMovies.value = moviesRes.subjects.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.cover,
        rate: item.rate
      }))
    }
    
    if (tvRes && tvRes.subjects) {
      hotTvShows.value = tvRes.subjects.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.cover,
        rate: item.rate
      }))
    }
    
    if (varietyRes && varietyRes.subjects) {
      hotVariety.value = varietyRes.subjects.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.cover,
        rate: item.rate
      }))
    }
    
    if (dramaRes && dramaRes.data && dramaRes.data.list) {
      shortDramas.value = dramaRes.data.list
    }
  } catch (error) {
    console.error('加载首页数据失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadHomeData()
}

const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}

const goDetail = (item, type) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${item.id}&type=${type}&title=${encodeURIComponent(item.title)}` 
  })
}

const goShortDramaDetail = (item) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${item.id}&type=shortdrama&title=${encodeURIComponent(item.name || item.title)}` 
  })
}

const goMore = (type) => {
  uni.navigateTo({ 
    url: `/pages/search/search?type=${type}` 
  })
}

const goTab = (url) => {
  uni.switchTab({ url })
}

onMounted(() => {
  loadHomeData()
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  height: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, rgba(15, 15, 26, 0.95), rgba(15, 15, 26, 0.8));
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
}

.logo {
  width: 48rpx;
  height: 48rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
  margin-left: 12rpx;
}

.header-actions {
  display: flex;
  align-items: center;
}

.search-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 107, 0.2);
  border-radius: 50%;
  font-size: 28rpx;
  color: #ff6b6b;
}

.content {
  flex: 1;
  margin-top: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.section-more {
  font-size: 24rpx;
  color: #888888;
}

.movie-scroll {
  white-space: nowrap;
}

.movie-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.movie-card {
  width: 200rpx;
  flex-shrink: 0;
}

.movie-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
}

.movie-info {
  padding: 8rpx 0;
}

.movie-title {
  font-size: 26rpx;
  color: #ffffff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-meta {
  display: flex;
  align-items: center;
  margin-top: 4rpx;
  gap: 8rpx;
}

.movie-rating {
  font-size: 22rpx;
  color: #f5a623;
}

.movie-episodes {
  font-size: 22rpx;
  color: #4ecdc4;
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
  font-size: 32rpx;
  color: #888888;
  margin-bottom: 8rpx;
}
</style>
