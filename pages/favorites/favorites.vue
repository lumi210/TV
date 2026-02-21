<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&#8592;</text>
      </view>
      <text class="header-title">我的收藏</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMore">
      <view class="filter-bar">
        <view 
          class="filter-item" 
          :class="{ active: currentType === '' }"
          @click="filterByType('')"
        >全部</view>
        <view 
          class="filter-item" 
          :class="{ active: currentType === 'movie' }"
          @click="filterByType('movie')"
        >电影</view>
        <view 
          class="filter-item" 
          :class="{ active: currentType === 'tv' }"
          @click="filterByType('tv')"
        >电视剧</view>
        <view 
          class="filter-item" 
          :class="{ active: currentType === 'shortdrama' }"
          @click="filterByType('shortdrama')"
        >短剧</view>
      </view>

      <view class="favorite-list">
        <view 
          class="favorite-item" 
          v-for="(item, index) in favoriteList" 
          :key="index"
          @click="goDetail(item)"
        >
          <image class="favorite-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
          <view class="favorite-info">
            <text class="favorite-title">{{ item.title }}</text>
            <view class="favorite-meta">
              <text class="favorite-type">{{ getTypeName(item.type) }}</text>
              <text class="favorite-time">{{ formatTime(item.createdAt) }}</text>
            </view>
          </view>
          <view class="favorite-delete" @click.stop="removeFavorite(item, index)">
            <text>&#128465;</text>
          </view>
        </view>

        <view class="loading" v-if="loading">
          <text>加载中...</text>
        </view>

        <view class="empty" v-if="!loading && favoriteList.length === 0">
          <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">暂无收藏</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { favoriteApi } from '../../api'

const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const currentType = ref('')
const favoriteList = ref([])

const loadFavorites = async (refresh = false) => {
  if (loading.value) return
  if (!refresh && !hasMore.value) return
  
  loading.value = true
  if (refresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const res = await favoriteApi.getFavorites({
      page: page.value,
      type: currentType.value
    })
    
    if (res.data) {
      if (refresh || page.value === 1) {
        favoriteList.value = res.data.list || []
      } else {
        favoriteList.value = [...favoriteList.value, ...(res.data.list || [])]
      }
      hasMore.value = (res.data.list || []).length >= 20
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadFavorites()
}

const filterByType = (type) => {
  currentType.value = type
  loadFavorites(true)
}

const removeFavorite = async (item, index) => {
  uni.showModal({
    title: '提示',
    content: '确定取消收藏吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await favoriteApi.removeFavorite(item.id)
          favoriteList.value.splice(index, 1)
          uni.showToast({ title: '已取消收藏', icon: 'none' })
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const goDetail = (item) => {
  uni.navigateTo({ 
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

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  loadFavorites(true)
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

.back-btn, .placeholder {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.content {
  flex: 1;
}

.filter-bar {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  background-color: #1a1a2e;
}

.filter-item {
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

.favorite-list {
  padding: 0 24rpx;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.favorite-cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
  flex-shrink: 0;
}

.favorite-info {
  flex: 1;
  padding: 0 24rpx;
}

.favorite-title {
  font-size: 30rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.favorite-type {
  font-size: 22rpx;
  color: #4ecdc4;
  padding: 4rpx 12rpx;
  background-color: rgba(78, 205, 196, 0.2);
  border-radius: 8rpx;
}

.favorite-time {
  font-size: 22rpx;
  color: #888888;
}

.favorite-delete {
  padding: 16rpx;
  font-size: 32rpx;
  color: #888888;
}

.loading {
  text-align: center;
  padding: 32rpx;
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
  font-size: 28rpx;
  color: #888888;
}
</style>
