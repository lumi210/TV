<template>
  <view class="page">
    <view class="header">
      <view class="search-bar">
        <view class="search-input-wrap">
          <text class="search-icon">&#128269;</text>
          <input 
            class="search-input" 
            v-model="keyword" 
            placeholder="搜索电影、电视剧、综艺..."
            @confirm="onSearch"
            confirm-type="search"
          />
          <text class="clear-icon" v-if="keyword" @click="clearKeyword">&#10005;</text>
        </view>
        <text class="cancel-btn" @click="goBack">取消</text>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="content"
      @scrolltolower="loadMore"
    >
      <view class="history-section" v-if="!keyword && searchHistory.length > 0">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @click="clearHistory">清空</text>
        </view>
        <view class="history-tags">
          <text 
            class="history-tag" 
            v-for="(item, index) in searchHistory" 
            :key="index"
            @click="searchByHistory(item)"
          >{{ item }}</text>
        </view>
      </view>

      <view class="hot-section" v-if="!keyword && hotList.length > 0">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="hot-list">
          <view 
            class="hot-item" 
            v-for="(item, index) in hotList" 
            :key="index"
            @click="goDetail(item)"
          >
            <text class="hot-rank" :class="{ 'top3': index < 3 }">{{ index + 1 }}</text>
            <text class="hot-title">{{ item.title }}</text>
            <text class="hot-badge" v-if="item.isNew">新</text>
          </view>
        </view>
      </view>

      <view class="filter-bar" v-if="keyword && total > 0">
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
          :class="{ active: currentType === 'variety' }"
          @click="filterByType('variety')"
        >综艺</view>
      </view>

      <view class="result-list" v-if="keyword">
        <view 
          class="result-item" 
          v-for="(item, index) in resultList" 
          :key="index"
          @click="goDetail(item)"
        >
          <image class="result-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
          <view class="result-info">
            <text class="result-title">{{ item.title }}</text>
            <text class="result-desc">{{ item.actors || '未知演员' }}</text>
            <view class="result-meta">
              <text class="result-type">{{ getTypeName(item.type) }}</text>
              <text class="result-year">{{ item.year }}</text>
              <text class="result-rating" v-if="item.rating">{{ item.rating }}分</text>
            </view>
          </view>
        </view>

        <view class="loading" v-if="loading">
          <text>加载中...</text>
        </view>

        <view class="no-more" v-if="!loading && !hasMore && resultList.length > 0">
          <text>没有更多了</text>
        </view>
      </view>

      <view class="empty" v-if="keyword && !loading && resultList.length === 0">
        <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
        <text class="empty-text">没有找到相关内容</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doubanApi } from '../../api'

const keyword = ref('')
const currentType = ref('')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const total = ref(0)
const resultList = ref([])
const searchHistory = ref([])
const hotList = ref([])

const loadHistory = () => {
  const history = uni.getStorageSync('searchHistory') || []
  searchHistory.value = history.slice(0, 10)
}

const loadHotList = async () => {
  try {
    const res = await doubanApi.getHome()
    if (res.data && res.data.hot) {
      hotList.value = res.data.hot
    }
  } catch (error) {
    console.error('加载热门搜索失败:', error)
  }
}

const onSearch = async () => {
  if (!keyword.value.trim()) return
  
  saveHistory(keyword.value.trim())
  page.value = 1
  hasMore.value = true
  resultList.value = []
  await search()
}

const search = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const res = await doubanApi.search({
      keyword: keyword.value,
      type: currentType.value,
      page: page.value
    })
    
    if (res.data) {
      if (page.value === 1) {
        resultList.value = res.data.list || []
      } else {
        resultList.value = [...resultList.value, ...(res.data.list || [])]
      }
      total.value = res.data.total || 0
      hasMore.value = resultList.value.length < total.value
    }
  } catch (error) {
    console.error('搜索失败:', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  search()
}

const saveHistory = (kw) => {
  let history = uni.getStorageSync('searchHistory') || []
  history = [kw, ...history.filter(item => item !== kw)].slice(0, 10)
  uni.setStorageSync('searchHistory', history)
  searchHistory.value = history
}

const clearHistory = () => {
  uni.removeStorageSync('searchHistory')
  searchHistory.value = []
}

const clearKeyword = () => {
  keyword.value = ''
  resultList.value = []
}

const searchByHistory = (kw) => {
  keyword.value = kw
  onSearch()
}

const filterByType = (type) => {
  currentType.value = type
  page.value = 1
  hasMore.value = true
  resultList.value = []
  search()
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

onMounted(() => {
  loadHistory()
  loadHotList()
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
  padding: 16rpx 24rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background-color: #0f0f1a;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #1a1a2e;
  border-radius: 40rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #888888;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #ffffff;
}

.clear-icon {
  font-size: 28rpx;
  color: #888888;
  padding: 8rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  margin-left: 24rpx;
}

.content {
  flex: 1;
  margin-top: 104rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
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

.clear-history {
  font-size: 24rpx;
  color: #888888;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 24rpx;
  background-color: #1a1a2e;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #888888;
}

.hot-list {
  padding: 0 24rpx;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.hot-rank {
  width: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #888888;
  text-align: center;
  
  &.top3 {
    color: #ff6b6b;
  }
}

.hot-title {
  flex: 1;
  font-size: 28rpx;
  color: #ffffff;
  margin-left: 16rpx;
}

.hot-badge {
  font-size: 20rpx;
  color: #ff6b6b;
  padding: 4rpx 12rpx;
  border: 1rpx solid #ff6b6b;
  border-radius: 8rpx;
}

.filter-bar {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  background-color: #0f0f1a;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-item {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #888888;
  background-color: #1a1a2e;
  border-radius: 24rpx;
  
  &.active {
    color: #ffffff;
    background-color: #ff6b6b;
  }
}

.result-list {
  padding: 0 24rpx;
}

.result-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.result-cover {
  width: 160rpx;
  height: 220rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  padding-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc {
  font-size: 24rpx;
  color: #888888;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.result-type {
  font-size: 22rpx;
  color: #4ecdc4;
  padding: 4rpx 12rpx;
  background-color: rgba(78, 205, 196, 0.2);
  border-radius: 8rpx;
}

.result-year {
  font-size: 22rpx;
  color: #888888;
}

.result-rating {
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
