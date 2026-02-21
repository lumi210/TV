<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>&#8592;</text>
      </view>
      <text class="header-title">设置</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="setting-section">
        <view class="section-title">播放设置</view>
        <view class="setting-item">
          <text class="setting-label">自动播放下一集</text>
          <switch :checked="autoPlayNext" @change="toggleAutoPlay" color="#ff6b6b" />
        </view>
        <view class="setting-item">
          <text class="setting-label">记住播放进度</text>
          <switch :checked="rememberProgress" @change="toggleRememberProgress" color="#ff6b6b" />
        </view>
        <view class="setting-item">
          <text class="setting-label">默认画质</text>
          <picker mode="selector" :range="qualityOptions" @change="changeQuality">
            <text class="setting-action">{{ qualityOptions[defaultQuality] }} ></text>
          </picker>
        </view>
      </view>

      <view class="setting-section">
        <view class="section-title">缓存管理</view>
        <view class="setting-item">
          <text class="setting-label">缓存大小</text>
          <text class="setting-value">{{ cacheSize }}</text>
        </view>
        <view class="setting-item" @click="clearCache">
          <text class="setting-label">清除缓存</text>
          <text class="setting-action">点击清除</text>
        </view>
      </view>

      <view class="setting-section" v-if="userStore.isLoggedIn">
        <view class="section-title">账号设置</view>
        <view class="setting-item" @click="changePassword">
          <text class="setting-label">修改密码</text>
          <text class="setting-action">></text>
        </view>
        <view class="setting-item" @click="showLogoutConfirm">
          <text class="setting-label logout-text">退出登录</text>
        </view>
      </view>

      <view class="setting-section">
        <view class="section-title">关于</view>
        <view class="setting-item">
          <text class="setting-label">版本</text>
          <text class="setting-value">v1.0.0</text>
        </view>
        <view class="setting-item" @click="checkUpdate">
          <text class="setting-label">检查更新</text>
          <text class="setting-action">点击检查</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const autoPlayNext = ref(true)
const rememberProgress = ref(true)
const defaultQuality = ref(0)
const cacheSize = ref('0KB')
const qualityOptions = ['自动', '高清', '标清', '流畅']

const loadSettings = () => {
  autoPlayNext.value = uni.getStorageSync('autoPlayNext') !== false
  rememberProgress.value = uni.getStorageSync('rememberProgress') !== false
  defaultQuality.value = uni.getStorageSync('defaultQuality') || 0
  
  calculateCacheSize()
}

const toggleAutoPlay = (e) => {
  autoPlayNext.value = e.detail.value
  uni.setStorageSync('autoPlayNext', autoPlayNext.value)
}

const toggleRememberProgress = (e) => {
  rememberProgress.value = e.detail.value
  uni.setStorageSync('rememberProgress', rememberProgress.value)
}

const changeQuality = (e) => {
  defaultQuality.value = e.detail.value
  uni.setStorageSync('defaultQuality', defaultQuality.value)
}

const calculateCacheSize = () => {
  const info = uni.getStorageInfoSync()
  const sizeKB = info.currentSize
  if (sizeKB < 1024) {
    cacheSize.value = sizeKB + 'KB'
  } else {
    cacheSize.value = (sizeKB / 1024).toFixed(2) + 'MB'
  }
}

const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定清除所有缓存吗？这将清除搜索历史等数据。',
    success: (res) => {
      if (res.confirm) {
        const keysToKeep = ['token', 'userInfo', 'autoPlayNext', 'rememberProgress', 'defaultQuality']
        const info = uni.getStorageInfoSync()
        
        info.keys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            uni.removeStorageSync(key)
          }
        })
        
        calculateCacheSize()
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

const changePassword = () => {
  uni.showModal({
    title: '修改密码',
    editable: true,
    placeholderText: '请输入新密码',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          uni.showToast({ title: '密码修改成功', icon: 'success' })
        } catch (error) {
          uni.showToast({ title: '修改失败', icon: 'none' })
        }
      }
    }
  })
}

const showLogoutConfirm = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/mine/mine' })
        }, 500)
      }
    }
  })
}

const checkUpdate = () => {
  uni.showToast({ title: '已是最新版本', icon: 'none' })
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  loadSettings()
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
  justify-content: space-between;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background-color: #1a1a2e;
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
  flex: 1;
  padding: 24rpx;
}

.setting-section {
  background-color: #1a1a2e;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.section-title {
  font-size: 26rpx;
  color: #888888;
  padding: 24rpx 24rpx 16rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #2d2d44;
  
  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  font-size: 30rpx;
  color: #ffffff;
  
  &.logout-text {
    color: #ff6b6b;
  }
}

.setting-value {
  font-size: 28rpx;
  color: #888888;
}

.setting-action {
  font-size: 28rpx;
  color: #ff6b6b;
}
</style>
