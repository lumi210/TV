<template>
  <view class="page">
    <text class="title">LunaTV</text>
    <view class="content">
      <text class="tip" v-if="!isLoggedIn" @click="goLogin">点击登录</text>
      <view v-else>
        <text class="welcome">欢迎，{{ username }}</text>
        <view class="list">
          <view class="item" v-for="(item, index) in movies" :key="index">
            <text>{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      username: '',
      movies: []
    }
  },
  onShow() {
    this.checkLogin()
  },
  methods: {
    checkLogin() {
      this.isLoggedIn = !!uni.getStorageSync('userInfo')
      this.username = uni.getStorageSync('userInfo')?.username || ''
      if (this.isLoggedIn) {
        this.loadMovies()
      }
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    loadMovies() {
      uni.request({
        url: '/api/douban?type=movie&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=10',
        withCredentials: true,
        success: (res) => {
          console.log('movies response:', res)
          if (res.data && res.data.list) {
            this.movies = res.data.list
          }
        },
        fail: (err) => {
          console.error('load movies failed:', err)
        }
      })
    }
  }
}
</script>

<style>
.page { padding: 50rpx 24rpx 24rpx; background: #0f0f1a; min-height: 100vh; }
.title { color: #ff6b6b; font-size: 40rpx; font-weight: bold; }
.content { margin-top: 32rpx; }
.tip { color: #ff6b6b; font-size: 32rpx; }
.welcome { color: #fff; font-size: 32rpx; }
.list { margin-top: 24rpx; }
.item { padding: 24rpx; background: #1a1a2e; margin-bottom: 16rpx; border-radius: 12rpx; }
.item text { color: #fff; font-size: 28rpx; }
</style>
