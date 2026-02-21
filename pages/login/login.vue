<template>
  <view class="page">
    <view class="header">
      <text class="header-title">登录</text>
    </view>

    <view class="content">
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input class="form-input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <text class="form-label">密码</text>
          <input class="form-input" v-model="password" placeholder="请输入密码" :password="true" />
        </view>

        <button class="login-btn" @click="handleLogin">登录</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!this.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }

      uni.request({
        url: '/api/login',
        method: 'POST',
        data: {
          username: this.username,
          password: this.password
        },
        withCredentials: true,
        success: (res) => {
          console.log('Login response:', res)
          
          if (res.statusCode === 200 && res.data && res.data.ok) {
            // 保存登录状态
            uni.setStorageSync('userInfo', { username: this.username })
            
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
              uni.switchTab({ url: '/pages/index/index' })
            }, 1000)
          } else {
            uni.showToast({ title: res.data?.error || '登录失败', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('Login error:', err)
          uni.showToast({ title: '网络错误', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.header-title { font-size: 36rpx; color: #fff; font-weight: bold; }
.content { padding: 32rpx; }
.form-section { background: #1a1a2e; border-radius: 16rpx; padding: 32rpx; }
.form-item { margin-bottom: 32rpx; }
.form-label { font-size: 28rpx; color: #fff; display: block; margin-bottom: 16rpx; }
.form-input { width: 100%; height: 88rpx; background: #0f0f1a; border-radius: 12rpx; padding: 0 24rpx; font-size: 30rpx; color: #fff; box-sizing: border-box; }
.login-btn { width: 100%; height: 96rpx; background: #ff6b6b; border-radius: 48rpx; font-size: 32rpx; color: #fff; border: none; }
</style>
