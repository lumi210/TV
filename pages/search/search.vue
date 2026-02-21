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

      <view class="result-list" v-if="keyword">
        <view 
          class="result-item" 
          v-for="(item, index) in resultList" 
          :key="index"
          @click="goDetail(item)"
        >
          <image class="result-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
          <view class="result-info">
            <text class="result-title">{{ item.name || item.title }}</text>
            <text class="result-desc" v-if="item.actor">{{ item.actor }}</text>
            <view class="result-meta">
              <text class="result-type" v-if="item.type">{{ item.type }}</text>
              <text class="result-year" v-if="item.year">{{ item.year }}</text>
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
const loading = ref(false)
const hasMore = ref(true)
const resultList = ref([])
const searchHistory = ref([])

const loadHistory = () => {
  const history = uni.getStorageSync('searchHistory') || []
  searchHistory.value = history.slice(0, 10)
}

const onSearch = async () => {
  if (!keyword.value.trim()) return
  
  saveHistory(keyword.value.trim())
  loading.value = true
  resultList.value = []
  
  try {
    const res = await doubanApi.search({ q: keyword.value })
    if (res.results) {
      resultList.value = res.results.map(item => ({
        id: item.id || item.vod_id,
        name: item.name || item.title || item.vod_name,
        title: item.name || item.title || item.vod_name,
        cover: item.cover || item.pic || item.vod_pic,
        actor: item.actor || item.vod_actor,
        type: item.type,
        year: item.year || item.vod_year,
        source: item.source
      }))
    }
    hasMore.value = false
  } catch (error) {
    console.error('搜索失败:', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
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

const goBack = () => {
  uni.navigateBack()
}

const goDetail = (item) => {
  const type = item.type || 'movie'
  uni.navigateTo({ 
    url: `/pages/play/play?id=${item.id}&type=${type}&title=${encodeURIComponent(item.name || item.title)}&source=${item.source || ''}` 
  })
}

onMounted(() => {
  loadHistory()
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
