<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">观看历史</text>
      <view class="clear-all" v-if="list.length > 0" @click="clearAll">
        <text>清空</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="list">
        <view class="item" v-for="(item, index) in list" :key="index" @click="goDetail(item)">
          <image class="cover" :src="getCover(item)" mode="aspectFill" lazy-load @error="onCoverError(item)" />
          <view class="info">
            <text class="title">{{ getTitle(item) }}</text>
            <view class="meta">
              <text class="source" v-if="item.source_name">{{ item.source_name }}</text>
              <text class="episode" v-if="getEpisode(item)">第{{ getEpisode(item) }}集</text>
            </view>
            <view class="progress-row" v-if="item.play_time && item.duration">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getProgressPercent(item) + '%' }"></view>
              </view>
              <text class="progress-text">{{ formatProgress(item.play_time, item.duration) }}</text>
            </view>
            <text class="time">{{ formatTime(getTime(item)) }}</text>
          </view>
          <view class="delete-btn" @click.stop="deleteItem(item, index)">
            <text>删除</text>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view class="empty" v-if="!loading && list.length === 0">
        <text class="empty-icon">&#128250;</text>
        <text class="empty-text">暂无观看记录</text>
        <text class="empty-tip">快去看看精彩内容吧</text>
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
        url: buildUrl('/api/playrecords'),
        withCredentials: true,
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            if (Array.isArray(res.data)) {
              this.list = res.data
            } else if (typeof res.data === 'object') {
              const records = res.data.records || res.data.list || res.data.data
              if (Array.isArray(records)) {
                this.list = records
              } else if (records && typeof records === 'object') {
                this.list = Object.entries(records).map(([key, value]) => ({
                  key,
                  ...value
                }))
              } else {
                this.list = Object.entries(res.data).map(([key, value]) => ({
                  key,
                  ...value
                }))
              }
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
    
    getCover(item) {
      const url = item.cover || item.poster || item.pic || item.thumb
      if (!url) {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMjIwIiB2aWV3Qm94PSIwIDAgMTYwIDIyMCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMjAiLz48dGV4dCB4PSI4MCIgeT0iMTEwIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6DmtITlm77niYc8L3RleHQ+PC9zdmc+'
      }
      return this.proxyImage(url)
    },
    
    proxyImage(url) {
      if (!url || url.startsWith('data:')) return url
      
      // 使用图片代理
      if (url.includes('doubanio.com')) {
        return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (!url.includes('monkeycode-ai.online') && !url.includes('localhost')) {
          return buildUrl('/api/image-proxy?url=' + encodeURIComponent(url))
        }
      }
      
      return url
    },
    
    onCoverError(item) {
      item.cover = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMjIwIiB2aWV3Qm94PSIwIDAgMTYwIDIyMCI+PHJlY3QgZmlsbD0iIzFhMWEyZSIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMjAiLz48dGV4dCB4PSI4MCIgeT0iMTEwIiBmaWxsPSIjODg4IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6DmtITlm77niYc8L3RleHQ+PC9zdmc+'
    },
    
    getTitle(item) {
      return item.title || item.name || item.videoTitle || '未知内容'
    },
    
    getEpisode(item) {
      return item.index || item.episode || item.episodeIndex || item.ep
    },
    
    getTime(item) {
      return item.save_time || item.updateTime || item.lastPlayTime || item.time || Date.now()
    },
    
    getProgressPercent(item) {
      if (!item.play_time || !item.duration) return 0
      return Math.min((item.play_time / item.duration) * 100, 100)
    },
    
    clearAll() {
      uni.showModal({
        title: '提示',
        content: '确定清空所有观看记录？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: buildUrl('/api/playrecords'),
              method: 'DELETE',
              withCredentials: true,
              success: () => {
                this.list = []
                uni.showToast({ title: '已清空', icon: 'success' })
              },
              fail: () => {
                uni.showToast({ title: '操作失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    
    deleteItem(item, index) {
      uni.showModal({
        title: '提示',
        content: '确定删除该记录？',
        success: (res) => {
          if (res.confirm) {
            const key = item.key || item.id || item._id
            if (key) {
              uni.request({
                url: buildUrl('/api/playrecords?key=') + encodeURIComponent(key),
                method: 'DELETE',
                withCredentials: true,
                success: () => {
                  this.list.splice(index, 1)
                  uni.showToast({ title: '已删除', icon: 'none' })
                },
                fail: () => {
                  this.list.splice(index, 1)
                  uni.showToast({ title: '已删除', icon: 'none' })
                }
              })
            } else {
              this.list.splice(index, 1)
              uni.showToast({ title: '已删除', icon: 'none' })
            }
          }
        }
      })
    },
    
    goDetail(item) {
      const title = this.getTitle(item)
      const key = item.key || ''
      
      if (key) {
        const parts = key.split('+')
        if (parts.length >= 2) {
          uni.navigateTo({
            url: '/pages/play/play?title=' + encodeURIComponent(title) + '&q=' + encodeURIComponent(title)
          })
          return
        }
      }
      
      if (item.url) {
        const playData = {
          title: title,
          poster: item.cover,
          episodes: [item.url],
          episodes_titles: ['正片']
        }
        uni.navigateTo({
          url: '/pages/play/play?title=' + encodeURIComponent(title) + '&data=' + encodeURIComponent(JSON.stringify(playData))
        })
        return
      }
      
      uni.navigateTo({
        url: '/pages/play/play?title=' + encodeURIComponent(title) + '&q=' + encodeURIComponent(title)
      })
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
      const date = new Date(ts)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${m}-${d}`
    },
    
    formatProgress(progress, duration) {
      if (!progress) return ''
      const formatNum = (n) => {
        const m = Math.floor(n / 60)
        const s = Math.floor(n % 60)
        return m + ':' + String(s).padStart(2, '0')
      }
      return formatNum(progress) + (duration ? ' / ' + formatNum(duration) : '')
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

.clear-all {
  padding: 12rpx 24rpx;
  
  text {
    color: $color-primary;
    font-size: 26rpx;
  }
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
  width: 160rpx;
  height: 220rpx;
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
  font-weight: bold;
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

.source {
  color: $color-secondary;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: rgba($color-secondary, 0.2);
  border-radius: 8rpx;
}

.episode {
  color: $color-warning;
  font-size: 24rpx;
}

.time {
  color: $color-text-muted;
  font-size: 24rpx;
  margin-top: 12rpx;
  display: block;
}

.progress-row {
  margin-top: 12rpx;
}

.progress-bar {
  width: 100%;
  height: 6rpx;
  background: $color-bg-tertiary;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 3rpx;
}

.progress-text {
  color: $color-text-muted;
  font-size: 20rpx;
  margin-top: 6rpx;
  display: block;
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  color: $color-text;
  font-size: 32rpx;
  font-weight: bold;
}

.empty-tip {
  color: $color-text-muted;
  font-size: 26rpx;
  margin-top: 12rpx;
}
</style>
