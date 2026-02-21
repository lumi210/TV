<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">观看历史</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="list">
        <view class="item" v-for="(item, index) in list" :key="index" @click="goDetail(item)">
          <image class="cover" :src="item.cover || item.pic" mode="aspectFill" lazy-load />
          <view class="info">
            <text class="title">{{ item.title || item.name }}</text>
            <view class="meta">
              <text class="episode" v-if="item.episode">第{{ item.episode }}集</text>
              <text class="time">{{ formatTime(item.updateTime || item.lastPlayTime) }}</text>
            </view>
            <view class="progress" v-if="item.progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: (item.progress / item.duration * 100) + '%' }"></view>
              </view>
              <text class="progress-text">{{ formatProgress(item.progress, item.duration) }}</text>
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
        <text>暂无观看记录</text>
        <text class="empty-tip">快去看看精彩内容吧</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
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
        url: '/api/playrecords',
        withCredentials: true,
        success: (res) => {
          if (res.data) {
            // 兼容不同的返回格式
            if (Array.isArray(res.data)) {
              this.list = res.data
            } else if (res.data.list) {
              this.list = res.data.list
            } else if (res.data.records) {
              this.list = res.data.records
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
        content: '确定删除该记录？',
        success: (res) => {
          if (res.confirm) {
            const id = item.id || item._id
            uni.request({
              url: '/api/playrecords/' + id,
              method: 'DELETE',
              withCredentials: true,
              success: () => {
                this.list.splice(index, 1)
                uni.showToast({ title: '已删除', icon: 'none' })
              },
              fail: () => {
                uni.showToast({ title: '删除失败', icon: 'none' })
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
      
      uni.navigateTo({
        url: '/pages/play/play?id=' + id + '&type=' + type + '&title=' + encodeURIComponent(title)
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
      const date = new Date(ts)
      const now = new Date()
      const diff = now - date
      
      // 小于1分钟
      if (diff < 60000) return '刚刚'
      // 小于1小时
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      // 小于24小时
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      // 小于7天
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      
      // 其他显示日期
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
      return formatNum(progress) + ' / ' + (duration ? formatNum(duration) : '')
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
  width: 160rpx;
  height: 220rpx;
  border-radius: 12rpx;
  background: $color-bg-secondary;
}

.info {
  flex: 1;
  padding-left: 20rpx;
  min-width: 0;
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

.episode {
  color: $color-secondary;
  font-size: 24rpx;
}

.time {
  color: $color-text-muted;
  font-size: 24rpx;
}

.progress {
  margin-top: 16rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: $color-bg-tertiary;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 4rpx;
}

.progress-text {
  color: $color-text-muted;
  font-size: 22rpx;
  margin-top: 8rpx;
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
