<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">登录</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <view class="logo-section">
        <text class="app-name">LunaTV</text>
        <text class="app-desc">影视聚合播放平台</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input class="form-input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <text class="form-label">密码</text>
          <input class="form-input" v-model="password" placeholder="请输入密码" :password="true" />
        </view>

        <button class="login-btn" :loading="loading" @click="handleLogin">登录</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!this.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      this.loading = true
      
      try {
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: '/api/login',
            method: 'POST',
            data: {
              username: this.username,
              password: this.password
            },
            success: (response) => {
              resolve(response)
            },
            fail: (err) => {
              reject(err)
            }
          })
        })
        
        console.log('Login response:', res)
        
        if (res.statusCode === 200 && res.data && res.data.ok) {
          const setCookie = res.header['set-cookie'] || res.header['Set-Cookie']
          if (setCookie) {
            let cookieValue = ''
            if (Array.isArray(setCookie)) {
              cookieValue = setCookie.map(c => c.split(';')[0]).join('; ')
            } else {
              cookieValue = setCookie.split(';')[0]
            }
            uni.setStorageSync('user_cookie', cookieValue)
            console.log('Cookie saved:', cookieValue.substring(0, 50))
          }
          
          uni.setStorageSync('userInfo', { username: this.username })
          
          uni.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1000)
        } else {
          uni.showToast({ title: res.data?.error || '登录失败', icon: 'none' })
        }
      } catch (error) {
        console.error('Login error:', error)
        uni.showToast({ title: '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #0f0f1a;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
}

.back-btn, .placeholder {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.content {
  padding: 48rpx 32rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.app-desc {
  font-size: 26rpx;
  color: #888888;
  margin-top: 8rpx;
}

.form-section {
  background-color: #1a1a2e;
  border-radius: 16rpx;
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background-color: #0f0f1a;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #ffffff;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 48rpx;
  font-size: 32rpx;
  color: #ffffff;
  border: none;
  margin-top: 16rpx;
}
</style>
