<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">搜索</text>
    </view>

    <view class="search-bar">
      <input class="search-input" v-model="keyword" placeholder="搜索电影、电视剧..." @confirm="search" confirm-type="search" />
    </view>

    <scroll-view scroll-y class="content">
      <view class="result-list">
        <view class="result-item" v-for="(item, index) in results" :key="index" @click="goDetail(item)">
          <image class="result-cover" :src="item.poster" mode="aspectFill" lazy-load />
          <view class="result-info">
            <text class="result-title">{{ item.title }}</text>
            <text class="result-meta" v-if="item.year || item.class">{{ item.year }} {{ item.class }}</text>
            <text class="result-source">{{ item.source_name || '未知来源' }}</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>搜索中...</text>
      </view>

      <view class="empty" v-if="!loading && searched && results.length === 0">
        <text>没有找到相关内容</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      results: [],
      loading: false,
      searched: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    search() {
      if (!this.keyword.trim()) return
      
      this.loading = true
      this.searched = false
      
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(this.keyword),
        withCredentials: true,
        success: (res) => {
          this.searched = true
          if (res.data && res.data.results) {
            this.results = res.data.results
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/play/play?title=' + encodeURIComponent(item.title) + '&data=' + encodeURIComponent(JSON.stringify(item))
      })
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/common.scss';

.page {
  height: 100vh;
  background: $color-bg;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $color-bg-secondary;
}

.back {
  width: 60rpx;
  
  text {
    color: $color-text;
    font-size: 36rpx;
  }
}

.header-title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  background: $color-bg;
  border-radius: 36rpx;
  color: $color-text;
  font-size: 28rpx;
}

.content {
  flex: 1;
}

.result-list {
  padding: 0 24rpx;
}

.result-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $color-border;
}

.result-cover {
  flex-shrink: 0;
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.result-info {
  flex: 1;
  padding-left: 24rpx;
  min-width: 0;
}

.result-title {
  color: $color-text;
  font-size: 30rpx;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  color: $color-text-muted;
  font-size: 24rpx;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-source {
  color: $color-secondary;
  font-size: 22rpx;
}

.loading, .empty {
  padding: 48rpx;
  text-align: center;
  
  text {
    color: $color-text-muted;
    font-size: 28rpx;
  }
}

/* 响应式适配 */
@media screen and (min-width: 768px) {
  .result-list {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
  }
  
  .result-item {
    width: calc(50% - 12rpx);
    border: none;
    background: $color-bg-secondary;
    border-radius: 12rpx;
    padding: 16rpx;
  }
}
</style>
