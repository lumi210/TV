<template>
  <view class="page">
    <view class="header">
      <text class="back" @click="goBack">&lt;</text>
      <text class="header-title">搜索</text>
    </view>
    <view class="content">
      <view class="search-bar">
        <input class="search-input" v-model="keyword" placeholder="搜索..." @confirm="search" />
      </view>
      <view class="result-list">
        <view class="item" v-for="(item, index) in list" :key="index" @click="goDetail(item)">
          <text class="title">{{ item.title }}</text>
        </view>
        <view class="empty" v-if="!loading && list.length === 0">
          <text>暂无搜索结果</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      list: [],
      loading: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async search() {
      if (!this.keyword) return
      this.loading = true
      const cookie = uni.getStorageSync('user_cookie')
      try {
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: '/api/search?q=' + encodeURIComponent(this.keyword),
            header: { 'Cookie': cookie },
            success: (r) => resolve(r.data),
            fail: reject
          })
        })
        this.list = res.results || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    goDetail(item) {
      uni.navigateTo({ url: '/pages/play/play?id=' + item.id })
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; display: flex; align-items: center; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; }
.content { padding: 24rpx; }
.search-input { width: 100%; padding: 24rpx; background: #1a1a2e; border-radius: 12rpx; color: #fff; }
.item { padding: 24rpx; background: #1a1a2e; margin-top: 16rpx; border-radius: 12rpx; }
.title { color: #fff; font-size: 28rpx; }
.empty { padding: 100rpx; text-align: center; }
.empty text { color: #888; }
</style>
