<template>
  <view class="page">
    <view class="header">
      <text class="back" @click="goBack">&lt;</text>
      <text class="header-title">注册</text>
    </view>
    <view class="content">
      <view class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="username" placeholder="请输入用户名" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" v-model="password" placeholder="请输入密码" :password="true" />
        </view>
        <view class="form-item">
          <text class="label">确认密码</text>
          <input class="input" v-model="password2" placeholder="请再次输入密码" :password="true" />
        </view>
        <button class="btn" @click="register">注册</button>
        <view class="link" @click="goLogin">
          <text>已有账号？去登录</text>
        </view>
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
      password2: ''
    }
  },
  methods: {
    goBack() { uni.navigateBack() },
    goLogin() { uni.navigateTo({ url: '/pages/login/login' }) },
    async register() {
      if (!this.username || !this.password) {
        uni.showToast({ title: '请填写完整', icon: 'none' })
        return
      }
      if (this.password !== this.password2) {
        uni.showToast({ title: '密码不一致', icon: 'none' })
        return
      }
      uni.showToast({ title: '请联系管理员注册', icon: 'none' })
    }
  }
}
</script>

<style>
.page { height: 100vh; background: #0f0f1a; }
.header { padding: 50rpx 24rpx 24rpx; background: #1a1a2e; display: flex; align-items: center; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; }
.form { padding: 24rpx; }
.form-item { margin-bottom: 24rpx; }
.label { color: #fff; font-size: 28rpx; display: block; margin-bottom: 8rpx; }
.input { width: 100%; padding: 24rpx; background: #1a1a2e; border-radius: 12rpx; color: #fff; }
.btn { width: 100%; padding: 24rpx; background: #ff6b6b; border-radius: 12rpx; color: #fff; font-size: 32rpx; margin-top: 24rpx; }
.link { text-align: center; margin-top: 24rpx; }
.link text { color: #ff6b6b; font-size: 26rpx; }
</style>
