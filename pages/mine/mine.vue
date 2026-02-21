<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="user-section" v-if="userStore.isLoggedIn">
        <view class="user-info">
          <image class="avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="user-detail">
            <text class="username">{{ userStore.username }}</text>
            <text class="user-level" v-if="userStore.userInfo?.level">Lv.{{ userStore.userInfo.level }}</text>
          </view>
        </view>
        <view class="user-stats">
          <view class="stat-item" @click="goPage('/pages/history/history')">
            <text class="stat-value">{{ stats.playCount || 0 }}</text>
            <text class="stat-label">观看记录</text>
          </view>
          <view class="stat-item" @click="goPage('/pages/favorites/favorites')">
            <text class="stat-value">{{ stats.favoriteCount || 0 }}</text>
            <text class="stat-label">我的收藏</text>
          </view>
          <view class="stat-item" v-if="userStore.userInfo?.points !== undefined">
            <text class="stat-value">{{ userStore.userInfo.points }}</text>
            <text class="stat-label">积分</text>
          </view>
        </view>
      </view>

      <view class="login-section" v-else @click="goLogin">
        <image class="default-avatar" src="/static/default-avatar.png" mode="aspectFill" />
        <text class="login-text">点击登录</text>
      </view>

      <view class="menu-section">
        <view class="menu-group">
          <view class="menu-item" @click="goPage('/pages/history/history')">
            <text class="menu-icon">&#9201;</text>
            <text class="menu-title">观看历史</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="goPage('/pages/favorites/favorites')">
            <text class="menu-icon">&#9829;</text>
            <text class="menu-title">我的收藏</text>
            <text class="menu-arrow">></text>
          </view>
        </view>

        <view class="menu-group">
          <view class="menu-item" @click="goPage('/pages/settings/settings')">
            <text class="menu-icon">&#9881;</text>
            <text class="menu-title">设置</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" v-if="userStore.isLoggedIn" @click="showAbout">
            <text class="menu-icon">&#8505;</text>
            <text class="menu-title">关于</text>
            <text class="menu-arrow">></text>
          </view>
        </view>

        <view class="menu-group" v-if="userStore.isLoggedIn">
          <view class="menu-item logout" @click="handleLogout">
            <text class="menu-title">退出登录</text>
          </view>
        </view>
      </view>

      <view class="version">
        <text>LunaTV v1.0.0</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { playApi, favoriteApi } from '../../api'

const userStore = useUserStore()
const stats = ref({
  playCount: 0,
  favoriteCount: 0
})

const loadStats = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const [playRes, favRes] = await Promise.all([
      playApi.getPlayRecords(),
      favoriteApi.getFavorites()
    ])
    
    stats.value.playCount = playRes.data?.total || 0
    stats.value.favoriteCount = favRes.data?.total || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const goPage = (url) => {
  if (!userStore.isLoggedIn && (url.includes('history') || url.includes('favorites'))) {
    goLogin()
    return
  }
  uni.navigateTo({ url })
}

const showAbout = () => {
  uni.showModal({
    title: '关于 LunaTV',
    content: 'LunaTV 是一款影视聚合播放平台移动端应用，支持电影、电视剧、综艺、短剧、直播等多种内容类型。\n\n版本: 1.0.0',
    showCancel: false
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    }
  })
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1a;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background-color: #1a1a2e;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.content {
  flex: 1;
}

.user-section {
  background-color: #1a1a2e;
  padding: 32rpx 24rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #2d2d44;
}

.user-detail {
  margin-left: 24rpx;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.user-level {
  font-size: 24rpx;
  color: #f5a623;
  margin-top: 8rpx;
  display: block;
}

.user-stats {
  display: flex;
  margin-top: 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 24rpx;
  color: #888888;
  margin-top: 8rpx;
}

.login-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx;
  background-color: #1a1a2e;
}

.default-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #2d2d44;
}

.login-text {
  font-size: 28rpx;
  color: #ff6b6b;
  margin-top: 16rpx;
}

.menu-section {
  margin-top: 24rpx;
}

.menu-group {
  background-color: #1a1a2e;
  margin-bottom: 24rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #2d2d44;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.logout {
    justify-content: center;
    
    .menu-title {
      color: #ff6b6b;
    }
  }
}

.menu-icon {
  font-size: 36rpx;
  color: #ff6b6b;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #ffffff;
}

.menu-arrow {
  font-size: 28rpx;
  color: #888888;
}

.version {
  text-align: center;
  padding: 48rpx;
  font-size: 24rpx;
  color: #555555;
}
</style>
