<template>
  <view class="page">
    <view class="header">
      <text class="title">LunaTV</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="section" v-if="hotMovies.length > 0">
        <view class="section-header">
          <text class="section-title">热门电影</text>
        </view>
        <scroll-view scroll-x class="movie-scroll">
          <view class="movie-list">
            <view class="movie-card" v-for="(item, index) in hotMovies" :key="index" @click="goDetail(item, 'movie')">
              <image class="movie-cover" :src="item.cover" mode="aspectFill" />
              <view class="movie-info">
                <text class="movie-title">{{ item.title }}</text>
                <text class="movie-rating" v-if="item.rate">{{ item.rate }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="login-tip" v-if="!loading && hotMovies.length === 0" @click="goLogin">
        <text>请先登录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const loading = ref(false)
    const hotMovies = ref([])

    const loadHomeData = async () => {
      const cookie = uni.getStorageSync('user_cookie')
      if (!cookie) {
        return
      }
      
      loading.value = true
      
      try {
        const res = await new Promise((resolve, reject) => {
          let url = '/api/douban?type=movie&tag=%E7%83%AD%E9%97%A8&pageStart=0&pageSize=10'
          
          uni.request({
            url: url,
            method: 'GET',
            header: {
              'Cookie': cookie
            },
            success: (response) => {
              resolve(response.data)
            },
            fail: (err) => {
              reject(err)
            }
          })
        })
        
        if (res && res.list) {
          hotMovies.value = res.list.map(item => ({
            id: item.id,
            title: item.title,
            cover: item.poster,
            rate: item.rate
          }))
        }
      } catch (error) {
        console.error('加载失败:', error)
      } finally {
        loading.value = false
      }
    }

    const goDetail = (item, type) => {
      uni.navigateTo({ 
        url: '/pages/play/play?id=' + item.id + '&type=' + type + '&title=' + encodeURIComponent(item.title)
      })
    }

    const goLogin = () => {
      uni.navigateTo({ url: '/pages/login/login' })
    }

    onMounted(() => {
      loadHomeData()
    })

    return {
      loading,
      hotMovies,
      goDetail,
      goLogin
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1a;
}

.header {
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background-color: #1a1a2e;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.content {
  flex: 1;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #888888;
}

.section {
  margin-top: 24rpx;
}

.section-header {
  padding: 0 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.movie-scroll {
  white-space: nowrap;
}

.movie-list {
  display: inline-flex;
  padding: 0 24rpx;
}

.movie-card {
  width: 200rpx;
  margin-right: 16rpx;
}

.movie-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  background-color: #1a1a2e;
}

.movie-info {
  padding: 8rpx 0;
}

.movie-title {
  font-size: 26rpx;
  color: #ffffff;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-rating {
  font-size: 22rpx;
  color: #f5a623;
}

.login-tip {
  text-align: center;
  padding: 100rpx;
  color: #ff6b6b;
  font-size: 32rpx;
}
</style>
