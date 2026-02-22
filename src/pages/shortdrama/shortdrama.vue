<template>
  <view class="page">
    <view class="header">
      <text class="header-title">短剧</text>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMore">
      <view class="drama-grid">
        <view class="drama-card" v-for="(item, index) in dramas" :key="index" @click="goDetail(item)">
          <image class="drama-cover" :src="item.cover" mode="aspectFill" />
          <view class="drama-info">
            <text class="drama-title">{{ item.name }}</text>
            <view class="drama-meta">
              <text class="drama-episodes" v-if="item.episode_count">{{ item.episode_count }}集</text>
              <text class="drama-score" v-if="item.score">{{ item.score }}分</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && dramas.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      dramas: [],
      loading: false,
      page: 1,
      hasMore: true
    }
  },
  onShow() {
    this.loadDramas()
  },
  methods: {
    loadDramas() {
      if (this.loading || !this.hasMore) return
      
      this.loading = true
      
      uni.request({
        url: '/api/shortdrama/list?page=' + this.page + '&size=20',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.data && res.data.data.list) {
            if (this.page === 1) {
              this.dramas = res.data.data.list
            } else {
              this.dramas = this.dramas.concat(res.data.data.list)
            }
            this.hasMore = res.data.data.hasMore
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++
        this.loadDramas()
      }
    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/play/play?id=' + item.id + '&type=shortdrama&title=' + encodeURIComponent(item.name)
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
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: #1a1a2e;
}

.header-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  flex: 1;
}

.drama-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
}

.drama-card {
  width: calc(50% - 16rpx);
  margin: 8rpx;
  background: #1a1a2e;
  border-radius: 12rpx;
  overflow: hidden;
}

.drama-cover {
  width: 100%;
  height: 360rpx;
}

.drama-info {
  padding: 16rpx;
}

.drama-title {
  color: #fff;
  font-size: 28rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drama-meta {
  margin-top: 8rpx;
  display: flex;
  gap: 12rpx;
}

.drama-episodes {
  color: #4ecdc4;
  font-size: 22rpx;
}

.drama-score {
  color: #f5a623;
  font-size: 22rpx;
}

.loading, .no-more {
  padding: 32rpx;
  text-align: center;
}

.loading text, .no-more text {
  color: #888;
  font-size: 26rpx;
}
</style>
