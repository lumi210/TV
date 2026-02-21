<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <view class="content">
      <view class="user-card" v-if="userInfo">
        <text class="username">{{ userInfo.username }}</text>
      </view>
      <view class="user-card" v-else @click="goLogin">
        <text class="login-text">点击登录</text>
      </view>

      <view class="menu-list">
        <view class="menu-item" @click="goPage('/pages/favorites/favorites')">
          <text>我的收藏</text>
          <text class="arrow">&gt;</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/history/history')">
          <text>观看历史</text>
          <text class="arrow">&gt;</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/settings/settings')">
          <text>设置</text>
          <text class="arrow">&gt;</text>
        </view>
      </view>

      <view class="logout-btn" v-if="userInfo" @click="logout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null
    }
  },
  onShow() {
    this.userInfo = uni.getStorageSync('userInfo')
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    goPage(url) {
      if (!this.userInfo) {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      uni.navigateTo({ url: url })
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userInfo')
            this.userInfo = null
            uni.showToast({ title: '已退出' })
          }
        }
      })
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  background: #0f0f1a;
}

.header {
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: #1a1a2e;
}

.header-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  padding: 24rpx;
}

.user-card {
  padding: 48rpx;
  background: #1a1a2e;
  border-radius: 16rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.username {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.login-text {
  color: #ff6b6b;
  font-size: 32rpx;
}

.menu-list {
  background: #1a1a2e;
  border-radius: 16rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #2d2d44;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item text {
  color: #fff;
  font-size: 30rpx;
}

.menu-item .arrow {
  color: #888;
}

.logout-btn {
  margin-top: 48rpx;
  padding: 32rpx;
  background: #1a1a2e;
  border-radius: 16rpx;
  text-align: center;
}

.logout-btn text {
  color: #ff6b6b;
  font-size: 30rpx;
}
</style>
