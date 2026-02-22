<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">{{ title }}</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view 
      scroll-y 
      class="content"
      @scrolltolower="loadMore"
    >
      <view class="grid">
        <view 
          class="item" 
          v-for="(item, index) in list" 
          :key="index"
          @click="searchAndPlay(item)"
        >
          <image 
            class="item-cover" 
            :src="getPoster(item)" 
            mode="aspectFill"
            lazy-load
          />
          <view class="item-info">
            <text class="item-title">{{ item.title || item.name }}</text>
            <text class="item-rate" v-if="item.rate || item.rating">{{ item.rate || item.rating }}分</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!hasMore && list.length > 0">
        <text>没有更多了</text>
      </view>

      <view class="empty" v-if="!loading && list.length === 0">
        <text>暂无内容</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: 'movie',
      title: '',
      list: [],
      loading: false,
      hasMore: true,
      pageStart: 0,
      pageSize: 24
    }
  },
  onLoad(options) {
    this.type = options.type || 'movie'
    this.title = decodeURIComponent(options.title || '更多')
    this.loadData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    getPoster(item) {
      return item.poster || item.cover || item.pic || '/static/default-cover.png'
    },
    
    async loadData(refresh = false) {
      if (this.loading) return
      if (!refresh && !this.hasMore) return
      
      this.loading = true
      if (refresh) {
        this.pageStart = 0
        this.hasMore = true
      }
      
      try {
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `/api/douban?type=${this.getDoubanType()}&tag=${this.getTag()}&pageStart=${this.pageStart}&pageSize=${this.pageSize}`,
            withCredentials: true,
            success: resolve,
            fail: reject
          })
        })
        
        if (res.data && res.data.list) {
          const items = res.data.list.map(item => ({
            id: item.id,
            title: item.title,
            poster: item.poster,
            rate: item.rate
          }))
          
          if (refresh || this.pageStart === 0) {
            this.list = items
          } else {
            this.list = [...this.list, ...items]
          }
          
          this.hasMore = items.length >= this.pageSize
          if (items.length > 0) {
            this.pageStart += this.pageSize
          }
        }
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.loadData()
    },
    
    getDoubanType() {
      // movie 类型就是 movie，其他都是 tv
      return this.type === 'movie' ? 'movie' : 'tv'
    },
    
    getTag() {
      const tagMap = {
        movie: '热门',
        tv: '热门',
        variety: '综艺',
        anime: '动漫'
      }
      return encodeURIComponent(tagMap[this.type] || '热门')
    },
    
    searchAndPlay(item) {
      uni.showLoading({ title: '搜索中...' })
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(item.title || item.name),
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
  justify-content: space-between;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $color-bg-secondary;
}

.back, .placeholder {
  width: 60rpx;
}

.back text {
  color: $color-text;
  font-size: 36rpx;
}

.header-title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  flex: 1;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 16rpx;
}

.item {
  width: calc(50% - 8rpx);
}

.item-cover {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.item-info {
  padding: 12rpx 8rpx;
}

.item-title {
  color: $color-text;
  font-size: 26rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-rate {
  color: $color-warning;
  font-size: 22rpx;
  margin-top: 4rpx;
  display: block;
}

.loading, .no-more {
  text-align: center;
  padding: 32rpx;
  
  text {
    color: $color-text-muted;
    font-size: 26rpx;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
  
  text {
    color: $color-text-muted;
    font-size: 30rpx;
  }
}

/* 响应式 */
@media screen and (min-width: 414px) {
  .item-cover { height: 320rpx; }
}

@media screen and (min-width: 768px) {
  .item {
    width: calc(33.33% - 11rpx);
  }
  .item-cover { height: 280rpx; }
}
</style>
