<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&#8592;</text>
      </view>
      <text class="header-title">登录</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">LunaTV</text>
        <text class="app-desc">影视聚合播放平台</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input 
            class="form-input" 
            v-model="form.username" 
            placeholder="请输入用户名"
            type="text"
          />
        </view>
        <view class="form-item">
          <text class="form-label">密码</text>
          <input 
            class="form-input" 
            v-model="form.password" 
            placeholder="请输入密码"
            :password="!showPassword"
          />
          <text class="toggle-pwd" @click="showPassword = !showPassword">
            {{ showPassword ? '&#128065;' : '&#128064;' }}
          </text>
        </view>

        <button class="login-btn" :loading="loading" @click="handleLogin">
          登录
        </button>

        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link" @click="goRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await userStore.login(form.value)
    if (result.success) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1000)
    } else {
      uni.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style lang="scss" scoped>
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

.logo {
  width: 120rpx;
  height: 120rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b6b;
  margin-top: 16rpx;
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
  position: relative;
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

.toggle-pwd {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 36rpx;
  color: #888888;
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
  
  &:active {
    opacity: 0.8;
  }
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  font-size: 26rpx;
  color: #888888;
}

.link {
  color: #ff6b6b;
  margin-left: 8rpx;
}
</style>
