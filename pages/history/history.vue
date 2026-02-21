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
          <image class="cover" :src="getCover(item)" mode="aspectFill" lazy-load />
          <view class="info">
            <text class="title">{{ getTitle(item) }}</text>
            <view class="meta">
              <text class="episode" v-if="getEpisode(item)">第{{ getEpisode(item) }}集</text>
              <text class="time">{{ formatTime(getTime(item)) }}</text>
            </view>
            <view class="progress" v-if="item.progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getProgressPercent(item) + '%' }"></view>
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
          console.log('playrecords response:', JSON.stringify(res.data))
          if (res.data) {
            if (Array.isArray(res.data)) {
              this.list = res.data
            } else if (res.data.list) {
              this.list = res.data.list
            } else if (res.data.records) {
              this.list = res.data.records
            } else if (res.data.data) {
              this.list = Array.isArray(res.data.data) ? res.data.data : []
            }
          }
          console.log('list:', JSON.stringify(this.list))
        },
        fail: () => {
          uni.showToast({ title: '加载失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    // 获取封面
    getCover(item) {
      return item.cover || item.pic || item.poster || item.thumb || ''
    },
    // 获取标题
    getTitle(item) {
      return item.title || item.name || item.videoTitle || item.videoName || '未知内容'
    },
    // 获取集数
    getEpisode(item) {
      return item.episode || item.episodeIndex || item.ep || ''
    },
    // 获取时间
    getTime(item) {
      return item.updateTime || item.lastPlayTime || item.createdAt || item.time || item.playTime || Date.now()
    },
    // 获取进度百分比
    getProgressPercent(item) {
      if (!item.progress || !item.duration) return 0
      return Math.min((item.progress / item.duration) * 100, 100)
    },
    deleteItem(item, index) {
      uni.showModal({
        title: '提示',
        content: '确定删除该记录？',
        success: (res) => {
          if (res.confirm) {
            const id = item.id || item._id || item.videoId
            if (!id) {
              this.list.splice(index, 1)
              uni.showToast({ title: '已删除', icon: 'none' })
              return
            }
            uni.request({
              url: '/api/playrecords/' + id,
              method: 'DELETE',
              withCredentials: true,
              success: () => {
                this.list.splice(index, 1)
                uni.showToast({ title: '已删除', icon: 'none' })
              },
              fail: () => {
                // 如果删除失败也本地移除
                this.list.splice(index, 1)
                uni.showToast({ title: '已删除', icon: 'none' })
              }
            })
          }
        }
      })
    },
    goDetail(item) {
      const id = item.videoId || item.id || item._id
      const type = item.type || item.videoType || 'movie'
      const title = this.getTitle(item)
      
      // 如果有播放地址，直接播放
      if (item.url || item.playUrl) {
        const playData = {
          title: title,
          poster: this.getCover(item),
          episodes: item.url ? [item.url] : [item.playUrl],
          episodes_titles: item.episode ? ['第' + item.episode + '集'] : ['正片']
        }
        uni.navigateTo({
          url: '/pages/play/play?title=' + encodeURIComponent(title) + '&data=' + encodeURIComponent(JSON.stringify(playData))
        })
        return
      }
      
      // 否则搜索
      uni.showLoading({ title: '搜索中...' })
      uni.request({
        url: '/api/search?q=' + encodeURIComponent(title),
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
