<template>
  <view class="page">
    <view class="header">
      <text class="header-title">短剧</text>
      <view class="header-actions">
        <view class="action-btn" @click="goSearch">
          <text class="search-icon">&#128269;</text>
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="content"
      @scrolltolower="loadMore"
    >
      <view class="category-bar">
        <scroll-view scroll-x class="category-scroll">
          <view class="category-list">
            <view 
              class="category-item" 
              :class="{ active: currentCategory === '' }"
              @click="selectCategory('')"
            >全部</view>
            <view 
              class="category-item" 
              :class="{ active: currentCategory === 'hot' }"
              @click="selectCategory('hot')"
            >热门</view>
            <view 
              class="category-item" 
              :class="{ active: currentCategory === 'new' }"
              @click="selectCategory('new')"
            >最新</view>
            <view 
              class="category-item" 
              :class="{ active: currentCategory === 'recommend' }"
              @click="selectCategory('recommend')"
            >推荐</view>
          </view>
        </scroll-view>
      </view>

      <view class="drama-grid">
        <view 
          class="drama-card" 
          v-for="(drama, index) in dramaList" 
          :key="index"
          @click="goDetail(drama)"
        >
          <view class="drama-cover-wrap">
            <image class="drama-cover" :src="drama.cover || '/static/default-cover.png'" mode="aspectFill" />
            <view class="drama-badge" v-if="drama.isNew">新</view>
            <view class="drama-episodes">{{ drama.episodes }}集</view>
          </view>
          <view class="drama-info">
            <text class="drama-title">{{ drama.title }}</text>
            <text class="drama-desc">{{ drama.desc || '暂无简介' }}</text>
            <view class="drama-meta">
              <text class="drama-views" v-if="drama.views">{{ formatViews(drama.views) }}</text>
              <text class="drama-rating" v-if="drama.rating">{{ drama.rating }}分</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!loading && !hasMore && dramaList.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty" v-if="!loading && dramaList.length === 0">
        <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
        <text class="empty-text">暂无短剧内容</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { shortDramaApi } from '../../api'

const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const currentCategory = ref('')
const dramaList = ref([])

const loadDramaList = async (refresh = false) => {
  if (loading.value) return
  if (!refresh && !hasMore.value) return
  
  loading.value = true
  if (refresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const res = await shortDramaApi.getDramaList({
      page: page.value,
      category: currentCategory.value
    })
    
    if (res.data) {
      if (refresh || page.value === 1) {
        dramaList.value = res.data.list || []
      } else {
        dramaList.value = [...dramaList.value, ...(res.data.list || [])]
      }
      hasMore.value = (res.data.list || []).length >= 20
    }
  } catch (error) {
    console.error('加载短剧列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadDramaList()
}

const selectCategory = (category) => {
  currentCategory.value = category
  loadDramaList(true)
}

const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/search?type=shortdrama' })
}

const goDetail = (drama) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${drama.id}&type=shortdrama&title=${encodeURIComponent(drama.title)}` 
  })
}

const formatViews = (views) => {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万'
  }
  return views
}

onMounted(() => {
  loadDramaList(true)
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background-color: #1a1a2e;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-actions {
  display: flex;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 107, 0.2);
  border-radius: 50%;
}

.search-icon {
  font-size: 28rpx;
  color: #ff6b6b;
}

.content {
  flex: 1;
}

.category-bar {
  background-color: #1a1a2e;
  border-bottom: 1rpx solid #2d2d44;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.category-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #888888;
  background-color: #0f0f1a;
  border-radius: 24rpx;
  
  &.active {
    color: #ffffff;
    background-color: #ff6b6b;
  }
}

.drama-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 16rpx;
}

.drama-card {
  width: calc(50% - 8rpx);
  background-color: #1a1a2e;
  border-radius: 12rpx;
  overflow: hidden;
}

.drama-cover-wrap {
  position: relative;
  width: 100%;
  height: 360rpx;
}

.drama-cover {
  width: 100%;
  height: 100%;
}

.drama-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background-color: #ff6b6b;
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 8rpx;
}

.drama-episodes {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  padding: 4rpx 12rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 8rpx;
}

.drama-info {
  padding: 16rpx;
}

.drama-title {
  font-size: 28rpx;
  color: #ffffff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drama-desc {
  font-size: 22rpx;
  color: #888888;
  margin-top: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drama-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  gap: 16rpx;
}

.drama-views {
  font-size: 22rpx;
  color: #4ecdc4;
}

.drama-rating {
  font-size: 22rpx;
  color: #f5a623;
}

.loading, .no-more {
  text-align: center;
  padding: 32rpx;
  color: #888888;
  font-size: 24rpx;
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
  font-size: 28rpx;
  color: #888888;
}
</style>
