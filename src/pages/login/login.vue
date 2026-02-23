<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">登录</text>
    </view>

    <view class="content">
      <view class="logo-section">
        <text class="app-name">{{ siteName }}</text>
        <text class="app-desc">影视聚合播放平台</text>
      </view>

      <view class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" v-model="password" placeholder="请输入密码" :password="true" />
        </view>

        <button class="login-btn" :loading="loading" @click="handleLogin">登录</button>

        <view class="register-link" @click="goRegister">
          <text>没有账号？立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getApiUrl } from '../../utils/config'

export default {
  data() {
    return {
      siteName: 'LunaTV',
      username: '',
      password: '',
      loading: false
    }
  },
  onShow() {
    const cached = uni.getStorageSync('siteName')
    if (cached) {
      this.siteName = cached
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/register/register' })
    },
    handleLogin() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!this.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      this.loading = true

      uni.request({
        url: getApiUrl('/api/login'),
        method: 'POST',
        data: {
          username: this.username,
          password: this.password
        },
        withCredentials: true,
        success: (res) => {
          console.log('[Login] response:', res.statusCode, res.data)
          if (res.statusCode === 200 && res.data && res.data.ok) {
            uni.setStorageSync('userInfo', { username: this.username })
            const headers = res.header || {}
            const setCookie = headers['set-cookie'] || headers['Set-Cookie']
            if (setCookie) {
              let cookieValue = ''
              if (Array.isArray(setCookie)) {
                cookieValue = setCookie.map(c => c.split(';')[0]).join('; ')
              } else {
                cookieValue = setCookie.split(';')[0]
              }
              uni.setStorageSync('user_cookie', cookieValue)
            } else {
              uni.setStorageSync('user_cookie', 'logged_in')
            }
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
              uni.switchTab({ url: '/pages/index/index' })
            }, 1000)
          } else {
            uni.showToast({ title: res.data?.error || '登录失败', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('[Login] failed:', err)
          uni.showToast({ title: '网络错误', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #0f0f1a;
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
  padding: 48rpx 32rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 64rpx;
}

.app-name {
  color: #ff6b6b;
  font-size: 48rpx;
  font-weight: bold;
}

.app-desc {
  color: #888;
  font-size: 26rpx;
  margin-top: 12rpx;
  display: block;
}

.form {
  background: #1a1a2e;
  border-radius: 16rpx;
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 16rpx;
  display: block;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #0f0f1a;
  border-radius: 12rpx;
  color: #fff;
  font-size: 30rpx;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: #ff6b6b;
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  margin-top: 16rpx;
}

.register-link {
  text-align: center;
  margin-top: 32rpx;
}

.register-link text {
  color: #ff6b6b;
  font-size: 26rpx;
}
</style>
