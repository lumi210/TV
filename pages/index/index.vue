<template>
  <view class="page">
    <view class="header">
      <text class="title">LunaTV</text>
      <view class="search-btn" @click="goSearch">
        <text>搜索</text>
      </view>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMore">
      <view class="section" v-if="movies.length > 0">
        <view class="section-header">
          <text class="section-title">热门电影</text>
        </view>
        <scroll-view scroll-x class="scroll-x">
          <view class="movie-list">
            <view class="movie-card" v-for="(item, index) in movies" :key="index" @click="goDetail(item)">
              <image class="movie-cover" :src="item.poster || item.cover" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <text class="movie-rate" v-if="item.rate">{{ item.rate }}分</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section" v-if="tvShows.length > 0">
        <view class="section-header">
          <text class="section-title">热门电视剧</text>
        </view>
        <scroll-view scroll-x class="scroll-x">
          <view class="movie-list">
            <view class="movie-card" v-for="(item, index) in tvShows" :key="index" @click="goDetail(item)">
              <image class="movie-cover" :src="item.poster || item.cover" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <text class="movie-rate" v-if="item.rate">{{ item.rate }}分</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section" v-if="varietyShows.length > 0">
        <view class="section-header">
          <text class="section-title">热门综艺</text>
        </view>
        <scroll-view scroll-x class="scroll-x">
          <view class="movie-list">
            <view class="movie-card" v-for="(item, index) in varietyShows" :key="index" @click="goDetail(item)">
              <image class="movie-cover" :src="item.poster || item.cover" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <text class="movie-rate" v-if="item.rate">{{ item.rate }}分</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="login-tip" v-if="!isLoggedIn" @click="goLogin">
        <text>请先登录</text>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      loading: false,
      movies: [],
      tvShows: [],
      varietyShows: []
    }
  },
  onShow() {
    this.isLoggedIn = !!uni.getStorageSync('userInfo')
    if (this.isLoggedIn) {
      this.loadData()
    }
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/search/search' })
    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/play/play?id=' + item.id + '&source=' + (item.source || '') + '&title=' + encodeURIComponent(item.title) + '&poster=' + encodeURIComponent(item.poster || '')
      })
    },
    loadData() {
      this.loadMovies()
      this.loadTvShows()
      this.loadVariety()
    },
    loadMovies() {
      uni.request({
        url: '/api/douban?type=movie&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=12',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.list) {
            this.movies = res.data.list
          }
        }
      })
    },
    loadTvShows() {
      uni.request({
        url: '/api/douban?type=tv&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=12',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.list) {
            this.tvShows = res.data.list
          }
        }
      })
    },
    loadVariety() {
      uni.request({
        url: '/api/douban?type=tv&tag=%E7%BB%BC%E8%89%BA&pageStart=0&pageSize=12',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.list) {
            this.varietyShows = res.data.list
          }
        }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: #ff6b6b;
  font-size: 40rpx;
  font-weight: bold;
}

.search-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 24rpx;
}

.search-btn text {
  color: #ff6b6b;
  font-size: 26rpx;
}

.content {
  flex: 1;
}

.section {
  margin-top: 24rpx;
}

.section-header {
  padding: 16rpx 24rpx;
}

.section-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.scroll-x {
  white-space: nowrap;
}

.movie-list {
  display: inline-flex;
  padding: 0 24rpx;
}

.movie-card {
  width: 200rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.movie-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  background: #1a1a2e;
}

.movie-info {
  padding: 8rpx 0;
}

.movie-title {
  color: #fff;
  font-size: 26rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-rate {
  color: #f5a623;
  font-size: 22rpx;
}

.login-tip {
  padding: 100rpx;
  text-align: center;
}

.login-tip text {
  color: #ff6b6b;
  font-size: 32rpx;
}

.loading {
  padding: 32rpx;
  text-align: center;
}

.loading text {
  color: #888;
  font-size: 26rpx;
}
</style>
