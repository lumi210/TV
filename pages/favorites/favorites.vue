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
          <image class="cover" :src="item.cover" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ item.title }}</text>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!loading && list.length === 0">
        <text>暂无收藏</text>
      </view>
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
        url: '/api/favorites',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.list) {
            this.list = res.data.list
          }
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/play/play?id=' + item.id + '&type=' + (item.type || 'movie') + '&title=' + encodeURIComponent(item.title)
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
  display: flex;
  align-items: center;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: #1a1a2e;
}

.back {
  width: 60rpx;
}

.back text {
  color: #fff;
  font-size: 36rpx;
}

.header-title {
  color: #fff;
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
  padding: 24rpx 0;
  border-bottom: 1rpx solid #1a1a2e;
}

.cover {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #1a1a2e;
}

.info {
  flex: 1;
  padding-left: 24rpx;
}

.title {
  color: #fff;
  font-size: 30rpx;
}

.empty {
  padding: 100rpx;
  text-align: center;
}

.empty text {
  color: #888;
}
</style>
