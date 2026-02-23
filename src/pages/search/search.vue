<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">搜索</text>
    </view>

    <view class="search-bar">
      <input 
        class="search-input" 
        v-model="keyword" 
        :placeholder="placeholder" 
        @confirm="search" 
        confirm-type="search" 
        :focus="true"
      />
      <view class="search-btn" @click="search">
        <text>搜索</text>
      </view>
    </view>

    <scroll-view scroll-y class="content" @scrolltolower="loadMoreResults">
      <!-- 搜索历史 -->
      <view class="history-section" v-if="!searched && searchHistory.length > 0">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-btn" @click="clearHistory">清空</text>
        </view>
        <view class="history-tags">
          <view 
            class="history-tag" 
            v-for="(item, index) in searchHistory" 
            :key="index"
            @click="searchFromHistory(item)"
          >
            <text>{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="hot-section" v-if="!searched">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="hot-tags">
          <view 
            class="hot-tag" 
            v-for="(item, index) in hotSearches" 
            :key="index"
            @click="searchFromHistory(item)"
          >
            <text class="hot-index" :class="{ top: index < 3 }">{{ index + 1 }}</text>
            <text class="hot-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索结果 -->
      <view class="result-list" v-if="searched">
        <view class="result-header">
          <text class="result-count">找到 {{ totalCount }} 个结果</text>
        </view>
        <view class="result-item" v-for="(item, index) in results" :key="index" @click="goDetail(item)">
          <image class="result-cover" :src="getPoster(item)" mode="aspectFill" lazy-load @error="onImageError($event, item)" />
          <view class="result-info">
            <text class="result-title">{{ item.title }}</text>
            <view class="result-meta-row" v-if="item.year || item.type_name">
              <text class="result-year" v-if="item.year">{{ item.year }}</text>
              <text class="result-type" v-if="item.type_name">{{ item.type_name }}</text>
            </view>
            <text class="result-desc" v-if="item.note">{{ item.note }}</text>
            <view class="result-source-row">
              <text class="result-source">{{ item.source_name || '未知来源' }}</text>
              <text class="result-episodes" v-if="item.episodes && item.episodes.length > 0">{{ item.episodes.length }}集</text>
            </view>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>搜索中...</text>
      </view>

      <view class="load-more" v-if="searched && !loading && hasMore">
        <text>加载更多...</text>
      </view>

      <view class="no-more" v-if="searched && !loading && !hasMore && results.length > 0">
        <text>没有更多结果了</text>
      </view>

      <view class="empty" v-if="!loading && searched && results.length === 0">
        <text class="empty-icon">&#128269;</text>
        <text class="empty-text">没有找到相关内容</text>
        <text class="empty-tip">试试其他关键词</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
import { buildUrl } from "../../utils/request"
export default {
  data() {
    return {
      keyword: '',
      results: [],
      loading: false,
      searched: false,
      searchHistory: [],
      hotSearches: ['流浪地球', '狂飙', '三体', '繁花', '庆余年', '与凤行', '长相思', '知否知否'],
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      placeholder: '搜索电影、电视剧...'
    }
  },
  onLoad() {
    this.loadSearchHistory()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    loadSearchHistory() {
      const history = uni.getStorageSync('searchHistory') || []
      this.searchHistory = history.slice(0, 10)
    },
    
    saveSearchHistory(keyword) {
      let history = uni.getStorageSync('searchHistory') || []
      history = history.filter(item => item !== keyword)
      history.unshift(keyword)
      history = history.slice(0, 20)
      uni.setStorageSync('searchHistory', history)
      this.searchHistory = history.slice(0, 10)
    },
    
    clearHistory() {
      uni.removeStorageSync('searchHistory')
      this.searchHistory = []
    },
    
    searchFromHistory(keyword) {
      this.keyword = keyword
      this.search()
    },
    
    getPoster(item) {
      if (!item.poster && !item.cover && !item.pic) {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTQwIDIwMCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyMDAiLz48dGV4dCB4PSI3MCIgeT0iMTAwIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6DmtITlm77niYc8L3RleHQ+PC9zdmc+'
      }
      const url = item.poster || item.cover || item.pic
      return this.proxyImage(url)
    },
    
    proxyImage(url) {
      if (!url || url.startsWith('data:')) return url
      
      // #ifdef H5
      // H5 端使用代理避免跨域
      if (url.includes('doubanio.com')) {
        return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (!url.includes('monkeycode-ai.online') && !url.includes('localhost')) {
          return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
        }
      }
      // #endif
      
      // #ifndef H5
      // APP 端直接使用原始 URL
      // #endif
      
      return url
    },
    
    onImageError(e, item) {
      item.poster = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTQwIDIwMCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyMDAiLz48dGV4dCB4PSI3MCIgeT0iMTAwIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6DmtITlm77niYc8L3RleHQ+PC9zdmc+'
    },
    
    search() {
      const trimmed = this.keyword.trim()
      if (!trimmed) return
      
      this.loading = true
      this.searched = true
      this.results = []
      this.currentPage = 1
      this.hasMore = false
      
      this.saveSearchHistory(trimmed)
      
      uni.request({
        url: buildUrl('/api/search?q=') + encodeURIComponent(trimmed),
        withCredentials: true,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.results) {
            this.results = res.data.results
            this.totalCount = this.results.length
            this.hasMore = this.results.length >= 20
          } else if (res.statusCode === 401) {
            uni.showToast({ title: '请先登录', icon: 'none' })
          } else {
            this.results = []
            this.totalCount = 0
          }
        },
        fail: () => {
          uni.showToast({ title: '搜索失败', icon: 'none' })
          this.results = []
          this.totalCount = 0
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    
    loadMoreResults() {
      if (!this.hasMore || this.loading) return
    },
    
    goDetail(item) {
      if (!this.checkLogin()) {
        return
      }
      uni.navigateTo({
        url: '/pages/play/play?title=' + encodeURIComponent(item.title) + '&data=' + encodeURIComponent(JSON.stringify(item))
      })
    },
    
    checkLogin() {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
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
  flex: 1;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: $color-bg-secondary;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: $color-bg;
  border-radius: 36rpx;
  color: $color-text;
  font-size: 28rpx;
}

.search-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
  border-radius: 36rpx;
  
  text {
    color: $color-text;
    font-size: 28rpx;
  }
}

.content {
  flex: 1;
}

/* 搜索历史 */
.history-section, .hot-section {
  padding: 24rpx;
  border-bottom: 1rpx solid $color-border;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  color: $color-text;
  font-size: 28rpx;
  font-weight: bold;
}

.clear-btn {
  color: $color-text-muted;
  font-size: 24rpx;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 24rpx;
  background: $color-bg-secondary;
  border-radius: 24rpx;
  
  text {
    color: $color-text-secondary;
    font-size: 26rpx;
  }
}

/* 热门搜索 */
.hot-tags {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hot-tag {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  
  &:active {
    background: $color-bg-secondary;
  }
}

.hot-index {
  width: 48rpx;
  color: $color-text-muted;
  font-size: 26rpx;
  font-weight: bold;
  
  &.top {
    color: $color-primary;
  }
}

.hot-text {
  color: $color-text;
  font-size: 28rpx;
}

/* 搜索结果 */
.result-list {
  padding: 0 24rpx;
}

.result-header {
  padding: 16rpx 0;
}

.result-count {
  color: $color-text-muted;
  font-size: 24rpx;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-title {
  color: $color-text;
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.result-year {
  color: $color-text-muted;
  font-size: 24rpx;
}

.result-type {
  color: $color-secondary;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: rgba($color-secondary, 0.2);
  border-radius: 8rpx;
}

.result-desc {
  color: $color-text-muted;
  font-size: 24rpx;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-source-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.result-source {
  color: $color-secondary;
  font-size: 22rpx;
}

.result-episodes {
  color: $color-warning;
  font-size: 22rpx;
}

/* 加载状态 */
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

.load-more, .no-more {
  text-align: center;
  padding: 32rpx;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
  }
}

/* 空状态 */
.empty {
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
