<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&#8592;</text>
      </view>
      <text class="header-title">注册</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
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
          <text class="form-label">邮箱</text>
          <input 
            class="form-input" 
            v-model="form.email" 
            placeholder="请输入邮箱"
            type="email"
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
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input 
            class="form-input" 
            v-model="form.confirmPassword" 
            placeholder="请再次输入密码"
            :password="!showConfirmPassword"
          />
          <text class="toggle-pwd" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '&#128065;' : '&#128064;' }}
          </text>
        </view>

        <view class="server-config">
          <text class="config-label">服务器地址</text>
          <input 
            class="config-input" 
            v-model="serverUrl" 
            placeholder="请输入服务器地址"
          />
        </view>

        <view class="invite-code">
          <text class="config-label">邀请码（选填）</text>
          <input 
            class="config-input" 
            v-model="form.inviteCode" 
            placeholder="请输入邀请码"
          />
        </view>

        <button class="register-btn" :loading="loading" @click="handleRegister">
          注册
        </button>

        <view class="login-link">
          <text>已有账号？</text>
          <text class="link" @click="goLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { setBaseUrl } from '../../utils/config'

const userStore = useUserStore()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: ''
})
const serverUrl = ref(uni.getStorageSync('serverUrl') || '')

const handleRegister = async () => {
  if (!form.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  if (!serverUrl.value) {
    uni.showToast({ title: '请配置服务器地址', icon: 'none' })
    return
  }

  setBaseUrl(serverUrl.value)
  uni.setStorageSync('serverUrl', serverUrl.value)

  loading.value = true
  try {
    const result = await userStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      inviteCode: form.value.inviteCode
    })
    
    if (result.success) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/login' })
      }, 1000)
    } else {
      uni.showToast({ title: result.message || '注册失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
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
  padding: 32rpx;
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

.server-config, .invite-code {
  margin-bottom: 32rpx;
}

.config-label {
  font-size: 24rpx;
  color: #888888;
  display: block;
  margin-bottom: 12rpx;
}

.config-input {
  width: 100%;
  height: 72rpx;
  background-color: #0f0f1a;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #888888;
  box-sizing: border-box;
}

.register-btn {
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

.login-link {
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
