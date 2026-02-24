<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">设置</text>
    </view>

    <view class="content">
      <view class="section">
        <text class="section-title">播放设置</text>
        <view class="item">
          <text>自动播放下一集</text>
          <switch :checked="autoPlay" @change="toggleAutoPlay" color="#ff6b6b" />
        </view>
      </view>

      <view class="section">
        <text class="section-title">缓存管理</text>
        <view class="item" @click="clearCache">
          <text>清除缓存</text>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">关于</text>
        <view class="item" @click="checkUpdate">
          <text>版本</text>
          <view class="version-info">
            <text class="version">v{{ appVersion }}</text>
            <text class="check-update" v-if="!isH5">检查更新</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { checkUpdate as doCheckUpdate, showUpdateDialog } from '../../utils/hot-update'

export default {
  data() {
    return {
      autoPlay: true,
      cacheSize: '0KB',
      appVersion: '1.0.0',
      isH5: false
    }
  },
  onShow() {
    this.autoPlay = uni.getStorageSync('autoPlay') !== false
    this.calcCache()
    this.getVersion()
    // #ifdef H5
    this.isH5 = true
    // #endif
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleAutoPlay(e) {
      this.autoPlay = e.detail.value
      uni.setStorageSync('autoPlay', this.autoPlay)
    },
    calcCache() {
      try {
        const info = uni.getStorageInfoSync()
        const kb = info.currentSize
        this.cacheSize = kb > 1024 ? (kb / 1024).toFixed(2) + 'MB' : kb + 'KB'
      } catch (e) {
        this.cacheSize = '0KB'
      }
    },
    getVersion() {
      try {
        const accountInfo = uni.getAccountInfoSync ? uni.getAccountInfoSync() : null
        if (accountInfo && accountInfo.miniProgram) {
          this.appVersion = accountInfo.miniProgram.appVersion || '1.0.0'
        }
      } catch (e) {
        this.appVersion = '1.0.0'
      }
    },
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定清除缓存？',
        success: (res) => {
          if (res.confirm) {
            const keepKeys = ['userInfo', 'autoPlay']
            try {
              const info = uni.getStorageInfoSync()
              info.keys.forEach(key => {
                if (!keepKeys.includes(key)) {
                  uni.removeStorageSync(key)
                }
              })
              this.calcCache()
              uni.showToast({ title: '已清除' })
            } catch (e) {
              uni.showToast({ title: '清除失败', icon: 'none' })
            }
          }
        }
      })
    },
    async checkUpdate() {
      // #ifdef H5
      uni.showToast({ title: 'H5无需更新', icon: 'none' })
      return
      // #endif

      uni.showLoading({ title: '检查中...', mask: true })
      try {
        const updateInfo = await doCheckUpdate()
        uni.hideLoading()
        
        if (updateInfo) {
          showUpdateDialog(updateInfo)
        } else {
          uni.showToast({ title: '已是最新版本', icon: 'success' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '检查失败', icon: 'none' })
      }
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
  padding: 24rpx;
}

.section {
  margin-bottom: 24rpx;
}

.section-title {
  color: #888;
  font-size: 26rpx;
  margin-bottom: 12rpx;
  display: block;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #1a1a2e;
  border-radius: 12rpx;
  margin-bottom: 2rpx;
}

.item text {
  color: #fff;
  font-size: 30rpx;
}

.cache-size, .version {
  color: #888;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.check-update {
  color: #ff6b6b;
  font-size: 26rpx;
}
</style>
