<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">我的收藏</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="list">
        <view class="item" v-for="(item, index) in list" :key="index" @click="goDetail(item)">
          <image class="cover" :src="item.cover || item.pic" mode="aspectFill" lazy-load />
          <view class="info">
            <text class="title">{{ item.title || item.name }}</text>
            <view class="meta">
              <text class="type" v-if="item.type">{{ getTypeName(item.type) }}</text>
              <text class="year" v-if="item.year">{{ item.year }}</text>
            </view>
          </view>
          <view class="delete-btn" @click.stop="deleteItem(item, index)">
            <text>删除</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && list.length === 0">
        <text>暂无收藏</text>
        <text class="empty-tip">快去收藏喜欢的内容吧</text>
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
      list: [],
      loading: false
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    loadData() {
      this.loading = true
      uni.request({
        url: buildUrl('/api/favorites'),
        withCredentials: true,
        success: (res) => {
          if (res.data) {
            if (Array.isArray(res.data)) {
              this.list = res.data
            } else if (res.data.list) {
              this.list = res.data.list
            } else if (res.data.favorites) {
              this.list = res.data.favorites
            } else {
              this.list = Object.entries(res.data).map(([key, value]) => ({
                ...value,
                _key: key
              }))
            }
          }
        },
        fail: () => {
          uni.showToast({ title: '加载失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    deleteItem(item, index) {
      uni.showModal({
        title: '提示',
        content: '确定取消收藏？',
        success: (res) => {
          if (res.confirm) {
            const key = item._key || item.key
            if (!key) {
              uni.showToast({ title: '无法删除：缺少key', icon: 'none' })
              return
            }
            uni.request({
              url: buildUrl('/api/favorites?key=') + encodeURIComponent(key),
              method: 'DELETE',
              withCredentials: true,
              success: (res) => {
                if (res.statusCode === 200) {
                  this.list.splice(index, 1)
                  uni.showToast({ title: '已取消', icon: 'none' })
                } else {
                  uni.showToast({ title: res.data?.error || '操作失败', icon: 'none' })
                }
              },
              fail: () => {
                uni.showToast({ title: '操作失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    goDetail(item) {
      const id = item.videoId || item.id
      const type = item.type || 'movie'
      const title = item.title || item.name
      
      // 如果有搜索数据，直接播放
      if (item.episodes && item.episodes.length > 0) {
        uni.navigateTo({
          url: '/pages/play/play?title=' + encodeURIComponent(title) + '&data=' + encodeURIComponent(JSON.stringify(item))
        })
      } else {
        // 否则先搜索
        uni.showLoading({ title: '搜索中...' })
        uni.request({
          url: buildUrl('/api/search?q=') + encodeURIComponent(title),
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
    },
    getTypeName(type) {
      const map = { movie: '电影', tv: '电视剧', variety: '综艺', anime: '动漫', shortdrama: '短剧' }
      return map[type] || type
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

.content {
  flex: 1;
}

.list {
  padding: 24rpx;
}

.item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-border;
}

.cover {
  flex-shrink: 0;
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.info {
  flex: 1;
  padding-left: 20rpx;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  color: $color-text;
  font-size: 30rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  gap: 16rpx;
}

.type {
  color: $color-secondary;
  font-size: 24rpx;
}

.year {
  color: $color-text-muted;
  font-size: 24rpx;
}

.delete-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 16rpx;
  
  text {
    color: $color-primary;
    font-size: 24rpx;
  }
}

.loading {
  text-align: center;
  padding: 48rpx;
  
  text {
    color: $color-text-muted;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  
  text {
    color: $color-text-muted;
    font-size: 30rpx;
  }
  
  .empty-tip {
    color: $color-text-muted;
    font-size: 26rpx;
    margin-top: 16rpx;
  }
}
</style>
