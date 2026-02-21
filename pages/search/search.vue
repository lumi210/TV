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
          <image class="result-cover" :src="item.pic || item.poster" mode="aspectFill" />
          <view class="result-info">
            <text class="result-title">{{ item.name || item.title }}</text>
            <text class="result-actor" v-if="item.actor">{{ item.actor }}</text>
            <text class="result-source" v-if="item.source">来源: {{ item.sourceName || item.source }}</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>搜索中...</text>
      </view>

      <view class="empty" v-if="!loading && searched && results.length === 0">
        <text>没有找到相关内容</text>
      </view>
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
            this.results = res.data.results.map(item => ({
              id: item.id || item.vod_id,
              name: item.name || item.title || item.vod_name,
              title: item.name || item.title || item.vod_name,
              pic: item.pic || item.poster || item.vod_pic,
              actor: item.actor || item.vod_actor,
              source: item.source,
              sourceName: item.sourceName
            }))
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/play/play?id=' + item.id + '&source=' + (item.source || '') + '&title=' + encodeURIComponent(item.name || item.title) + '&poster=' + encodeURIComponent(item.pic || '')
      })
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: #1a1a2e;
}

.back {
  width: 60rpx;
}

.back text {
  color: #fff;
  font-size: 36rpx;
}

.header-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #1a1a2e;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 24rpx;
  background: #0f0f1a;
  border-radius: 36rpx;
  color: #fff;
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
  border-bottom: 1rpx solid #1a1a2e;
}

.result-cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #1a1a2e;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  padding-left: 24rpx;
}

.result-title {
  color: #fff;
  font-size: 30rpx;
  display: block;
  margin-bottom: 8rpx;
}

.result-actor {
  color: #888;
  font-size: 24rpx;
  display: block;
}

.result-source {
  color: #4ecdc4;
  font-size: 22rpx;
  margin-top: 8rpx;
  display: block;
}

.loading, .empty {
  padding: 48rpx;
  text-align: center;
}

.loading text, .empty text {
  color: #888;
  font-size: 28rpx;
}
</style>
