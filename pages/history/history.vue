<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&#8592;</text>
      </view>
      <text class="header-title">观看历史</text>
      <view class="clear-btn" @click="clearHistory">
        <text>清空</text>
      </view>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMore">
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="(item, index) in historyList" 
          :key="index"
          @click="goDetail(item)"
        >
          <image class="history-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill" />
          <view class="history-info">
            <text class="history-title">{{ item.title }}</text>
            <text class="history-episode" v-if="item.episode">第{{ item.episode }}集</text>
            <view class="history-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getProgress(item) + '%' }"></view>
              </view>
              <text class="progress-text">{{ formatProgress(item) }}</text>
            </view>
          </view>
          <view class="history-delete" @click.stop="removeHistory(item, index)">
            <text>&#128465;</text>
          </view>
        </view>

        <view class="loading" v-if="loading">
          <text>加载中...</text>
        </view>

        <view class="empty" v-if="!loading && historyList.length === 0">
          <image class="empty-image" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">暂无观看记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { playApi } from '../../api'

const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const historyList = ref([])

const loadHistory = async (refresh = false) => {
  if (loading.value) return
  if (!refresh && !hasMore.value) return
  
  loading.value = true
  if (refresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const res = await playApi.getPlayRecords({ page: page.value })
    
    if (res.data) {
      if (refresh || page.value === 1) {
        historyList.value = res.data.list || []
      } else {
        historyList.value = [...historyList.value, ...(res.data.list || [])]
      }
      hasMore.value = (res.data.list || []).length >= 20
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadHistory()
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空所有观看记录吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          for (const item of historyList.value) {
            await playApi.deletePlayRecord(item.id)
          }
          historyList.value = []
          uni.showToast({ title: '已清空', icon: 'none' })
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const removeHistory = async (item, index) => {
  try {
    await playApi.deletePlayRecord(item.id)
    historyList.value.splice(index, 1)
    uni.showToast({ title: '已删除', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const getProgress = (item) => {
  if (!item.duration || !item.progress) return 0
  return Math.min(100, (item.progress / item.duration) * 100)
}

const formatProgress = (item) => {
  if (!item.progress) return '未观看'
  const minutes = Math.floor(item.progress / 60)
  if (minutes < 1) return '刚开始'
  return `已看${minutes}分钟`
}

const goBack = () => {
  uni.navigateBack()
}

const goDetail = (item) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${item.id}&type=${item.type || 'movie'}&episode=${item.episode || 1}&title=${encodeURIComponent(item.title)}` 
  })
}

onMounted(() => {
  loadHistory(true)
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

.back-btn {
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

.clear-btn {
  font-size: 26rpx;
  color: #ff6b6b;
  padding: 12rpx 24rpx;
}

.content {
  flex: 1;
}

.history-list {
  padding: 0 24rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.history-cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  padding: 0 24rpx;
}

.history-title {
  font-size: 30rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.history-episode {
  font-size: 24rpx;
  color: #4ecdc4;
  margin-bottom: 12rpx;
  display: block;
}

.history-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 6rpx;
  background-color: #2d2d44;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ff6b6b;
  border-radius: 3rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #888888;
  min-width: 100rpx;
}

.history-delete {
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
