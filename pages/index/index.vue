<template>
  <view class="page">
    <view class="header">
      <view class="header-content">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="title">LunaTV</text>
      </view>
      <view class="header-actions">
        <view class="search-btn" @click="goSearch">
          <text class="iconfont icon-search">&#xe600;</text>
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
      <view class="banner-container" v-if="bannerList.length > 0">
        <swiper 
          class="banner-swiper" 
          :indicator-dots="true" 
          :autoplay="true" 
          :interval="5000"
          indicator-color="rgba(255,255,255,0.3)"
          indicator-active-color="#ff6b6b"
        >
          <swiper-item v-for="(item, index) in bannerList" :key="index" @click="goDetail(item)">
            <image class="banner-image" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
            <view class="banner-info">
              <text class="banner-title">{{ item.title }}</text>
              <text class="banner-desc">{{ item.desc }}</text>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="section" v-for="(section, sIndex) in sections" :key="sIndex">
        <view class="section-header">
          <text class="section-title">{{ section.title }}</text>
          <text class="section-more" @click="goCategory(section)">更多 ></text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view 
              class="movie-card" 
              v-for="(item, index) in section.list" 
              :key="index"
              @click="goDetail(item)"
            >
              <image class="movie-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <view class="movie-meta">
                  <text class="movie-rating" v-if="item.rating">{{ item.rating }}</text>
                  <text class="movie-year">{{ item.year }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && sections.length === 0">
        <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
        <text class="empty-text">暂无内容</text>
        <text class="empty-tip">请在设置中配置服务器地址</text>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doubanApi } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const loading = ref(false)
const refreshing = ref(false)
const bannerList = ref([])
const sections = ref([])

const loadHomeData = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await doubanApi.getHome()
    if (res.data) {
      bannerList.value = res.data.banner || []
      sections.value = res.data.sections || []
    }
  } catch (error) {
    console.error('加载首页数据失败:', error)
    uni.showToast({
      title: '加载失败，请检查服务器配置',
      icon: 'none'
    })
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

const goDetail = (item) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${item.id}&type=${item.type || 'movie'}&title=${encodeURIComponent(item.title)}` 
  })
}

const goCategory = (section) => {
  uni.navigateTo({ 
    url: `/pages/search/search?category=${section.type || ''}&title=${encodeURIComponent(section.title)}` 
  })
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
}

.icon-search {
  color: #ff6b6b;
  font-size: 32rpx;
}

.content {
  flex: 1;
  margin-top: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.banner-container {
  padding: 24rpx;
}

.banner-swiper {
  height: 360rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.banner-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.banner-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
}

.movie-rating {
  font-size: 22rpx;
  color: #f5a623;
  margin-right: 8rpx;
}

.movie-year {
  font-size: 22rpx;
  color: #888888;
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

.empty-tip {
  font-size: 24rpx;
  color: #555555;
}
</style>
