<template>
  <view class="page">
    <!-- Custom Navigation Bar -->
    <view class="custom-navbar">
      <text class="navbar-title">{{ siteName }}</text>
      <view class="navbar-search" @click="goSearch">
        <text class="search-icon">&#128269;</text>
        <text class="search-placeholder">搜索影片...</text>
      </view>
    </view>
    
    <!-- Hero Banner -->
    <view class="hero-banner" v-if="bannerItems.length > 0" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <swiper 
        class="hero-swiper" 
        :current="currentBanner" 
        :autoplay="!isSwiping" 
        :interval="8000" 
        :duration="800"
        circular
        @change="onBannerChange"
      >
        <swiper-item v-for="(item, index) in bannerItems" :key="index">
          <view class="hero-slide">
            <image 
              class="hero-backdrop" 
              :src="getBackdrop(item)" 
              mode="aspectFill"
              lazy-load
            />
            <view class="hero-gradient"></view>
            <view class="hero-content">
              <view class="hero-info">
                <text class="hero-title">{{ item.title || item.name }}</text>
                <view class="hero-meta" v-if="item.rate || item.year">
                  <text class="hero-rate" v-if="item.rate">{{ item.rate }}分</text>
                  <text class="hero-year" v-if="item.year">{{ item.year }}</text>
                </view>
                <text class="hero-desc" v-if="item.description">{{ item.description }}</text>
              </view>
              <view class="hero-actions">
                <view class="hero-btn hero-btn-play" @click="playBanner(item)">
                  <text class="hero-btn-icon">&#9654;</text>
                  <text>播放</text>
                </view>
                <view class="hero-btn hero-btn-info" @click="showDetail(item)">
                  <text class="hero-btn-icon">&#8505;</text>
                  <text>详情</text>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      
      <!-- Banner Indicators -->
      <view class="hero-indicators">
        <view 
          v-for="(item, index) in bannerItems" 
          :key="index"
          class="hero-indicator"
          :class="{ active: index === currentBanner }"
          @click="currentBanner = index"
        ></view>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view 
      scroll-y 
      class="content" 
      :refresher-enabled="true" 
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- Quick Categories -->
      <view class="quick-cats">
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          <text>推荐</text>
        </view>
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'movie' }"
          @click="activeCategory = 'movie'"
        >
          <text>电影</text>
        </view>
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'tv' }"
          @click="activeCategory = 'tv'"
        >
          <text>电视剧</text>
        </view>
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'variety' }"
          @click="activeCategory = 'variety'"
        >
          <text>综艺</text>
        </view>
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'anime' }"
          @click="activeCategory = 'anime'"
        >
          <text>动漫</text>
        </view>
        <view 
          class="quick-cat-item" 
          :class="{ active: activeCategory === 'shortdrama' }"
          @click="activeCategory = 'shortdrama'"
        >
          <text>短剧</text>
        </view>
      </view>

      <!-- Hot Movies -->
      <view class="section" v-if="movies.length > 0 && (activeCategory === 'all' || activeCategory === 'movie')">
        <view class="section-header">
          <text class="section-title">热门电影</text>
          <text class="section-more" @click="goMore('movie', '热门电影')">
            更多 <text class="more-arrow">&#10095;</text>
          </text>
        </view>
        <scroll-view scroll-x class="scroll-x" :show-scrollbar="false" enable-flex>
          <view class="video-list">
            <view class="video-card" v-for="(item, index) in movies" :key="index" @click="searchAndPlay(item)">
              <view class="video-poster-wrap">
                <image 
                  class="video-poster" 
                  :src="getPoster(item)" 
                  mode="aspectFill" 
                  lazy-load
                  @error="onImageError($event, item)"
                />
                <view class="video-rate" v-if="item.rate">
                  <text>{{ item.rate }}</text>
                </view>
              </view>
              <view class="video-info">
                <text class="video-title">{{ item.title || item.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Hot TV Shows -->
      <view class="section" v-if="tvShows.length > 0 && (activeCategory === 'all' || activeCategory === 'tv')">
        <view class="section-header">
          <text class="section-title">热门电视剧</text>
          <text class="section-more" @click="goMore('tv', '热门电视剧')">
            更多 <text class="more-arrow">&#10095;</text>
          </text>
        </view>
        <scroll-view scroll-x class="scroll-x" :show-scrollbar="false" enable-flex>
          <view class="video-list">
            <view class="video-card" v-for="(item, index) in tvShows" :key="index" @click="searchAndPlay(item)">
              <view class="video-poster-wrap">
                <image 
                  class="video-poster" 
                  :src="getPoster(item)" 
                  mode="aspectFill" 
                  lazy-load
                  @error="onImageError($event, item)"
                />
                <view class="video-rate" v-if="item.rate">
                  <text>{{ item.rate }}</text>
                </view>
              </view>
              <view class="video-info">
                <text class="video-title">{{ item.title || item.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Hot Variety Shows -->
      <view class="section" v-if="varietyShows.length > 0 && (activeCategory === 'all' || activeCategory === 'variety')">
        <view class="section-header">
          <text class="section-title">热门综艺</text>
          <text class="section-more" @click="goMore('variety', '热门综艺')">
            更多 <text class="more-arrow">&#10095;</text>
          </text>
        </view>
        <scroll-view scroll-x class="scroll-x" :show-scrollbar="false" enable-flex>
          <view class="video-list">
            <view class="video-card" v-for="(item, index) in varietyShows" :key="index" @click="searchAndPlay(item)">
              <view class="video-poster-wrap">
                <image 
                  class="video-poster" 
                  :src="getPoster(item)" 
                  mode="aspectFill" 
                  lazy-load
                  @error="onImageError($event, item)"
                />
                <view class="video-rate" v-if="item.rate">
                  <text>{{ item.rate }}</text>
                </view>
              </view>
              <view class="video-info">
                <text class="video-title">{{ item.title || item.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Hot Anime - 今日番剧 -->
      <view class="section" v-if="todayAnimes.length > 0 && (activeCategory === 'all' || activeCategory === 'anime')">
        <view class="section-header">
          <text class="section-title">今日番剧</text>
          <text class="section-more" @click="goMore('anime', '今日番剧')">
            更多 <text class="more-arrow">&#10095;</text>
          </text>
        </view>
        <scroll-view scroll-x class="scroll-x" :show-scrollbar="false" enable-flex>
          <view class="video-list">
            <view class="video-card" v-for="(item, index) in todayAnimes" :key="index" @click="playBangumi(item)">
              <view class="video-poster-wrap">
                <image 
                  class="video-poster" 
                  :src="getBangumiPoster(item)" 
                  mode="aspectFill" 
                  lazy-load
                />
                <view class="video-rate" v-if="item.rating && item.rating.score">
                  <text>{{ item.rating.score.toFixed(1) }}</text>
                </view>
              </view>
              <view class="video-info">
                <text class="video-title">{{ item.name_cn || item.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Hot Short Dramas -->
      <view class="section" v-if="shortDramas.length > 0 && (activeCategory === 'all' || activeCategory === 'shortdrama')">
        <view class="section-header">
          <text class="section-title">热门短剧</text>
          <text class="section-more" @click="goShortDrama">
            更多 <text class="more-arrow">&#10095;</text>
          </text>
        </view>
        <scroll-view scroll-x class="scroll-x" :show-scrollbar="false" enable-flex>
          <view class="video-list">
            <view class="video-card" v-for="(item, index) in shortDramas" :key="index" @click="playShortDrama(item)">
              <view class="video-poster-wrap">
                <image 
                  class="video-poster" 
                  :src="item.cover" 
                  mode="aspectFill" 
                  lazy-load
                />
                <view class="video-rate" v-if="item.score || item.vote_average">
                  <text>{{ (item.score || item.vote_average).toFixed(1) }}</text>
                </view>
                <view class="video-episodes" v-if="item.episode_count && item.episode_count > 1">
                  <text>{{ item.episode_count }}集</text>
                </view>
              </view>
              <view class="video-info">
                <text class="video-title">{{ item.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Login Tip -->
      <view class="login-tip" v-if="!isLoggedIn" @click="goLogin">
        <view class="login-tip-icon">
          <text>&#128100;</text>
        </view>
        <text class="login-tip-text">登录后查看个性化推荐</text>
        <text class="login-tip-btn">立即登录</text>
      </view>

      <!-- Loading -->
      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>
      
      <!-- Error State -->
      <view class="error-state" v-if="!loading && loadError">
        <text class="error-icon">&#9888;</text>
        <text class="error-text">请登录账号使用</text>
      </view>
      
      <!-- Empty State -->
      <view class="empty-state" v-if="!loading && !loadError && movies.length === 0 && tvShows.length === 0 && varietyShows.length === 0 && todayAnimes.length === 0 && shortDramas.length === 0">
        <text class="empty-icon">&#128191;</text>
        <text class="empty-text">暂无影片数据</text>
        <text class="empty-tip">下拉刷新试试</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>

    <!-- Floating Search Button -->
    <view class="float-search" @click="goSearch">
      <text class="float-search-icon">&#128269;</text>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { getApiUrl } from '../../utils/config'

export default {
  data() {
    return {
      siteName: 'LunaTV',
      isLoggedIn: false,
      loading: false,
      refreshing: false,
      activeCategory: 'all',
      currentBanner: 0,
      isSwiping: false,
      touchStartX: 0,
      bannerItems: [],
      movies: [],
      tvShows: [],
      varietyShows: [],
      todayAnimes: [],
      shortDramas: [],
      loadError: false
    }
  },
  onShow() {
    this.isLoggedIn = !!uni.getStorageSync('userInfo')
    this.loadSiteConfig()
    this.loadData()
  },
  methods: {
    loadSiteConfig() {
      uni.request({
        url: getApiUrl('/api/server-config'),
        withCredentials: true,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.SiteName) {
            this.siteName = res.data.SiteName
            uni.setStorageSync('siteName', res.data.SiteName)
          }
        },
        fail: () => {
          const cached = uni.getStorageSync('siteName')
          if (cached) {
            this.siteName = cached
          }
        }
      })
    },
    getPoster(item) {
      if (!item.poster && !item.cover && !item.pic) {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiB2aWV3Qm94PSIwIDAgMjAwIDI4MCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiLz48dGV4dCB4PSIxMDAiIHk9IjE0MCIgZmlsbD0iIzg4OCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5peg5rSE5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
      }
      const url = item.poster || item.cover || item.pic
      return this.proxyImage(url)
    },
    
    getBackdrop(item) {
      if (!item.backdrop && !item.poster && !item.cover) {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiB2aWV3Qm94PSIwIDAgODAwIDQ1MCI+PHJlY3QgZmlsbD0iIzBmMGYxYSIgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0NTAiLz48dGV4dCB4PSI0MDAiIHk9IjIyNSIgZmlsbD0iIzg4OCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5peg5rSE5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
      }
      const url = item.backdrop || item.poster || item.cover
      return this.proxyImage(url)
    },
    
    proxyImage(url) {
      if (!url || url.startsWith('data:')) return url
      
      // 使用图片代理（H5 避免跨域，APP 端避免防盗链）
      if (url.includes('doubanio.com')) {
        return getApiUrl('/api/image-proxy?url=' + encodeURIComponent(url))
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (!url.includes('monkeycode-ai.online') && !url.includes('localhost')) {
          return getApiUrl('/api/image-proxy?url=' + encodeURIComponent(url))
        }
      }
      
      return url
    },
    
    onImageError(e, item) {
      console.log('image load error:', item.title, item.poster)
      item.poster = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiB2aWV3Qm94PSIwIDAgMjAwIDI4MCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiLz48dGV4dCB4PSIxMDAiIHk9IjE0MCIgZmlsbD0iIzg4OCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5peg5rSE5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
      this.$forceUpdate()
    },
    
    onTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.isSwiping = true
    },
    
    onTouchEnd(e) {
      this.isSwiping = false
    },
    
    onBannerChange(e) {
      this.currentBanner = e.detail.current
    },
    
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    
    goSearch() {
      uni.navigateTo({ url: '/pages/search/search' })
    },
    
    goMore(type, title) {
      uni.navigateTo({ 
        url: '/pages/more/more?type=' + type + '&title=' + encodeURIComponent(title)
      })
    },
    
    playBanner(item) {
      this.searchAndPlay(item)
    },
    
    showDetail(item) {
      this.searchAndPlay(item)
    },
    
    searchAndPlay(item) {
      if (!this.checkLogin()) {
        return
      }
      const title = item.title || item.name
      uni.navigateTo({
        url: '/pages/play/play?q=' + encodeURIComponent(title) + '&title=' + encodeURIComponent(title)
      })
    },
    
    checkLogin() {
      const userInfo = uni.getStorageSync('userInfo')
      const userCookie = uni.getStorageSync('user_cookie')
      if (!userInfo || !userCookie) {
        uni.showModal({
          title: '提示',
          content: '请登录账号后观看影片',
          showCancel: true,
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return false
      }
      return true
    },
    
    loadData() {
      this.loading = true
      this.loadError = false
      Promise.all([
        this.loadMovies(),
        this.loadTvShows(),
        this.loadVariety(),
        this.loadBangumiCalendar(),
        this.loadShortDramas()
      ]).then((results) => {
        const hasError = results.some(r => r === 'error')
        if (hasError) {
          this.loadError = true
        }
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
        this.updateBannerItems()
      })
    },
    
    updateBannerItems() {
      const allItems = [...this.movies.slice(0, 3), ...this.tvShows.slice(0, 2)]
      if (allItems.length > 0) {
        this.bannerItems = allItems.map(item => ({
          ...item,
          backdrop: item.poster
        }))
      }
    },
    
    loadMovies() {
      return new Promise((resolve) => {
        uni.request({
          url: getApiUrl('/api/douban?type=movie&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=12'),
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.list) {
              this.movies = res.data.list.map(item => ({
                id: item.id,
                title: item.title,
                poster: item.poster,
                rate: item.rate,
                year: item.year
              }))
              resolve('success')
            } else {
              resolve('error')
            }
          },
          fail: () => {
            resolve('error')
          },
          complete: () => {}
        })
      })
    },
    
    loadTvShows() {
      return new Promise((resolve) => {
        uni.request({
          url: getApiUrl('/api/douban?type=tv&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=12'),
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.list) {
              this.tvShows = res.data.list.map(item => ({
                id: item.id,
                title: item.title,
                poster: item.poster,
                rate: item.rate,
                year: item.year
              }))
              resolve('success')
            } else {
              resolve('error')
            }
          },
          fail: () => {
            resolve('error')
          },
          complete: () => {}
        })
      })
    },
    
    loadVariety() {
      return new Promise((resolve) => {
        uni.request({
          url: getApiUrl('/api/douban?type=tv&tag=%E7%BB%BC%E8%89%BA&pageStart=0&pageSize=12'),
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.list) {
              this.varietyShows = res.data.list.map(item => ({
                id: item.id,
                title: item.title,
                poster: item.poster,
                rate: item.rate,
                year: item.year
              }))
              resolve('success')
            } else {
              resolve('error')
            }
          },
          fail: () => {
            resolve('error')
          },
          complete: () => {}
        })
      })
    },
    
    loadBangumiCalendar() {
      return new Promise((resolve) => {
        uni.request({
          url: getApiUrl('/api/proxy/bangumi?path=calendar'),
          withCredentials: true,
          success: (res) => {
            console.log('[Index] bangumi calendar response:', res.statusCode, res.data?.length)
            if (res.statusCode === 200 && Array.isArray(res.data)) {
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              const today = new Date()
              const currentWeekday = weekdays[today.getDay()]
              
              const todayData = res.data.find(item => item.weekday && item.weekday.en === currentWeekday)
              if (todayData && todayData.items) {
                this.todayAnimes = todayData.items.slice(0, 12)
                console.log('[Index] today animes:', this.todayAnimes.length)
              }
              resolve('success')
            } else {
              console.error('[Index] bangumi calendar load failed')
              resolve('error')
            }
          },
          fail: (err) => {
            console.error('[Index] bangumi calendar request failed:', err)
            resolve('error')
          }
        })
      })
    },
    
    getBangumiPoster(item) {
      if (item.images) {
        return item.images.large || item.images.common || item.images.medium || item.images.small || item.images.grid || ''
      }
      return ''
    },
    
    playBangumi(item) {
      if (!this.checkLogin()) {
        return
      }
      const title = item.name_cn || item.name
      uni.navigateTo({
        url: '/pages/play/play?q=' + encodeURIComponent(title) + '&title=' + encodeURIComponent(title)
      })
    },
    
    loadShortDramas() {
      return new Promise((resolve) => {
        uni.request({
          url: getApiUrl('/api/shortdrama/list?categoryId=1&page=1&size=12'),
          withCredentials: true,
          success: (res) => {
            if (res.statusCode === 200 && res.data) {
              let list = []
              if (Array.isArray(res.data)) {
                list = res.data
              } else if (res.data.list) {
                list = res.data.list
              }
              this.shortDramas = list.slice(0, 12)
              resolve('success')
            } else {
              resolve('error')
            }
          },
          fail: () => {
            resolve('error')
          }
        })
      })
    },
    
    playShortDrama(item) {
      if (!this.checkLogin()) {
        return
      }
      uni.navigateTo({
        url: '/pages/play/play?id=' + item.id + '&type=shortdrama&title=' + encodeURIComponent(item.name)
      })
    },
    
    goShortDrama() {
      uni.switchTab({ url: '/pages/shortdrama/shortdrama' })
    },
    
    loadMore() {
      // 可扩展加载更多逻辑
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
  min-height: 100vh;
  background: $color-bg;
  padding-top: 88rpx;
}

/* Custom Navigation Bar */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: $color-bg-secondary;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.navbar-title {
  color: $color-primary;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 24rpx;
}

.navbar-search {
  flex: 1;
  height: 60rpx;
  background: $color-bg;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search-icon {
  color: $color-text-muted;
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  color: $color-text-muted;
  font-size: 26rpx;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  width: 100%;
  height: 50vw;
  max-height: 400rpx;
  min-height: 280rpx;
  overflow: hidden;
}

.hero-swiper {
  width: 100%;
  height: 100%;
}

.hero-slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-backdrop {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-gradient {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 300rpx;
  background: linear-gradient(to top, $color-bg 0%, rgba($color-bg, 0.8) 40%, transparent 100%);
}

.hero-gradient::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 200rpx;
  background: linear-gradient(to bottom, rgba($color-bg, 0.6) 0%, transparent 100%);
}

.hero-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.hero-info {
  margin-bottom: 24rpx;
}

.hero-title {
  color: $color-text;
  font-size: 40rpx;
  font-weight: bold;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.hero-rate {
  background: linear-gradient(135deg, #f5a623 0%, #ff6b6b 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.hero-year {
  color: $color-text-secondary;
  font-size: 26rpx;
}

.hero-desc {
  color: $color-text-secondary;
  font-size: 24rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 85%;
}

.hero-actions {
  display: flex;
  gap: 16rpx;
}

.hero-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  
  text {
    color: $color-text;
  }
}

.hero-btn-icon {
  font-size: 24rpx;
}

.hero-btn-play {
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
  box-shadow: 0 4rpx 16rpx rgba($color-primary, 0.4);
}

.hero-btn-info {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.hero-indicators {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  display: flex;
  gap: 8rpx;
}

.hero-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  
  &.active {
    width: 32rpx;
    border-radius: 8rpx;
    background: $color-primary;
  }
}

/* Quick Categories */
.quick-cats {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  background: $color-bg;
  overflow-x: auto;
  white-space: nowrap;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.quick-cat-item {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  background: $color-bg-secondary;
  color: $color-text-muted;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
    color: $color-text;
    box-shadow: 0 4rpx 12rpx rgba($color-primary, 0.3);
  }
}

/* Content */
.content {
  flex: 1;
  height: calc(100vh - 88rpx - constant(safe-area-inset-top));
  height: calc(100vh - 88rpx - env(safe-area-inset-top));
}

/* Section */
.section {
  margin-top: 16rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
}

.section-title {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
}

.section-more {
  font-size: 24rpx;
  color: $color-text-muted;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.more-arrow {
  font-size: 20rpx;
}

/* Scroll X */
.scroll-x {
  width: 100%;
  white-space: nowrap;
}

/* Video List */
.video-list {
  display: flex;
  flex-direction: row;
  padding: 0 24rpx;
  gap: 16rpx;
}

/* Video Card - Netflix Style */
.video-card {
  flex-shrink: 0;
  width: 200rpx;
}

.video-poster-wrap {
  position: relative;
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: $color-bg-secondary;
}

.video-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:active .video-poster {
  transform: scale(1.05);
}

.video-rate {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: linear-gradient(135deg, #f5a623 0%, #ff6b6b 100%);
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}

.video-episodes {
  position: absolute;
  bottom: 8rpx;
  left: 8rpx;
  background: rgba(0, 0, 0, 0.7);
  color: #4ecdc4;
  font-size: 18rpx;
  font-weight: bold;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}

.video-info {
  padding: 12rpx 4rpx;
}

.video-title {
  color: $color-text;
  font-size: 26rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Login Tip */
.login-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin: 24rpx;
  background: linear-gradient(135deg, $color-bg-secondary 0%, $color-bg-tertiary 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.login-tip-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 40rpx;
  }
}

.login-tip-text {
  flex: 1;
  margin-left: 20rpx;
  color: $color-text-secondary;
  font-size: 28rpx;
}

.login-tip-btn {
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
  color: $color-text;
  font-size: 26rpx;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
    margin-top: 16rpx;
  }
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid $color-bg-tertiary;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 48rpx;
}

.error-icon {
  font-size: 80rpx;
  color: $color-warning;
  margin-bottom: 24rpx;
}

.error-text {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.error-tip {
  color: $color-text-muted;
  font-size: 26rpx;
  margin-bottom: 32rpx;
}

.error-btn {
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
  color: $color-text;
  font-size: 28rpx;
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 48rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: $color-text-muted;
  margin-bottom: 24rpx;
}

.empty-text {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.empty-tip {
  color: $color-text-muted;
  font-size: 26rpx;
}

/* Floating Search Button */
.float-search {
  position: fixed;
  right: 24rpx;
  bottom: calc(180rpx + constant(safe-area-inset-bottom));
  bottom: calc(180rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba($color-primary, 0.4);
  z-index: 100;
}

.float-search-icon {
  font-size: 40rpx;
}

/* Safe Area */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Responsive */
@media screen and (max-width: 375px) {
  .video-card { width: 160rpx; }
  .video-poster-wrap { width: 160rpx; height: 224rpx; }
  .hero-banner { height: 480rpx; }
}

@media screen and (min-width: 414px) {
  .video-card { width: 220rpx; }
  .video-poster-wrap { width: 220rpx; height: 308rpx; }
  .hero-banner { height: 600rpx; }
}

@media screen and (min-width: 768px) {
  .video-card { width: 240rpx; }
  .video-poster-wrap { width: 240rpx; height: 336rpx; }
  .video-list { gap: 24rpx; }
  .hero-banner { height: 720rpx; }
}
</style>
