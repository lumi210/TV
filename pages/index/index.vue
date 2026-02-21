<template>
  <view class="page">
    <view class="header">
      <text class="title">LunaTV</text>
      <view class="search-btn" @click="goSearch">
        <text>搜索</text>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="content" 
      :refresher-enabled="true" 
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section" v-if="movies.length > 0">
        <view class="section-header">
          <text class="section-title">热门电影</text>
        </view>
        <scroll-view scroll-x class="scroll-x">
          <view class="movie-list">
            <view class="movie-card" v-for="(item, index) in movies" :key="index" @click="searchAndPlay(item)">
              <image class="movie-cover" :src="item.poster" mode="aspectFill" lazy-load />
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
            <view class="movie-card" v-for="(item, index) in tvShows" :key="index" @click="searchAndPlay(item)">
              <image class="movie-cover" :src="item.poster" mode="aspectFill" lazy-load />
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
            <view class="movie-card" v-for="(item, index) in varietyShows" :key="index" @click="searchAndPlay(item)">
              <image class="movie-cover" :src="item.poster" mode="aspectFill" lazy-load />
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
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      loading: false,
      refreshing: false,
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
    searchAndPlay(item) {
      uni.showLoading({ title: '搜索中...' })
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(item.title),
        withCredentials: true,
        success: (res) => {
          uni.hideLoading()
          if (res.data && res.data.results && res.data.results.length > 0) {
            const first = res.data.results[0]
            uni.navigateTo({
              url: '/pages/play/play?title=' + encodeURIComponent(first.title) + '&data=' + encodeURIComponent(JSON.stringify(first))
            })
          } else {
            uni.showToast({ title: '未找到播放源', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '搜索失败', icon: 'none' })
        }
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
    },
    onRefresh() {
      this.refreshing = true
      this.loadData()
      setTimeout(() => {
        this.refreshing = false
      }, 1000)
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
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $color-bg-secondary;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: $color-primary;
  font-size: 40rpx;
  font-weight: bold;
}

.search-btn {
  padding: 12rpx 24rpx;
  background: rgba($color-primary, 0.2);
  border-radius: 24rpx;
  
  text {
    color: $color-primary;
    font-size: 26rpx;
  }
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
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
}

.scroll-x {
  white-space: nowrap;
}

.movie-list {
  display: flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.movie-card {
  flex-shrink: 0;
  width: 200rpx;
}

.movie-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.movie-info {
  padding: 8rpx 0;
}

.movie-title {
  color: $color-text;
  font-size: 26rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-rate {
  color: $color-warning;
  font-size: 22rpx;
}

.login-tip {
  padding: 100rpx;
  text-align: center;
  
  text {
    color: $color-primary;
    font-size: 32rpx;
  }
}

.loading {
  padding: 32rpx;
  text-align: center;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
  }
}

/* 响应式适配 */
@media screen and (max-width: 375px) {
  .movie-card {
    width: 160rpx;
  }
  .movie-cover {
    width: 160rpx;
    height: 224rpx;
  }
}

@media screen and (min-width: 414px) {
  .movie-card {
    width: 220rpx;
  }
  .movie-cover {
    width: 220rpx;
    height: 308rpx;
  }
}

@media screen and (min-width: 768px) {
  .movie-card {
    width: 240rpx;
  }
  .movie-cover {
    width: 240rpx;
    height: 336rpx;
  }
  .movie-list {
    gap: 24rpx;
  }
}
</style>
