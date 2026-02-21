<template>
  <view class="page">
    <view class="header">
      <text class="header-title">短剧</text>
    </view>

    <scroll-view 
      scroll-y 
      class="content"
      @scrolltolower="loadMore"
    >
      <view class="drama-grid">
        <view 
          class="drama-card" 
          v-for="(drama, index) in dramaList" 
          :key="index"
          @click="goDetail(drama)"
        >
          <view class="drama-cover-wrap">
            <image class="drama-cover" :src="drama.cover || '/static/default-cover.png'" mode="aspectFill" />
            <view class="drama-episodes" v-if="drama.episode_count">{{ drama.episode_count }}集</view>
          </view>
          <view class="drama-info">
            <text class="drama-title">{{ drama.name }}</text>
            <text class="drama-desc" v-if="drama.description">{{ drama.description }}</text>
            <view class="drama-meta">
              <text class="drama-score" v-if="drama.score">{{ drama.score }}分</text>
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
    const res = await shortDramaApi.getList(page.value, 20)
    
    if (res.data && res.data.list) {
      if (refresh || page.value === 1) {
        dramaList.value = res.data.list
      } else {
        dramaList.value = [...dramaList.value, ...res.data.list]
      }
      hasMore.value = res.data.hasMore || false
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

const goDetail = (drama) => {
  uni.navigateTo({ 
    url: `/pages/play/play?id=${drama.id}&type=shortdrama&title=${encodeURIComponent(drama.name)}` 
  })
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

.content {
  flex: 1;
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
}

.drama-score {
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
