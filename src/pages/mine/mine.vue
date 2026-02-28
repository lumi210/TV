<template>
  <view class="page">
    <view class="header">
      <text class="header-title">我的</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="user-card" v-if="userInfo">
        <view class="user-header">
          <text class="username">{{ userInfo.username }}</text>
          <view class="vip-badge" v-if="cardKeyInfo && !cardKeyInfo.isExpired">
            <text>VIP</text>
          </view>
        </view>
        
        <view class="cardkey-info" v-if="cardKeyInfo">
          <view class="cardkey-row">
            <text class="cardkey-label">会员状态</text>
            <text class="cardkey-value" :class="{ active: !cardKeyInfo.isExpired }">
              {{ cardKeyInfo.isExpired ? '已过期' : '有效' }}
            </text>
          </view>
          <view class="cardkey-row" v-if="cardKeyInfo.expiresAt">
            <text class="cardkey-label">到期时间</text>
            <text class="cardkey-value">{{ formatTime(cardKeyInfo.expiresAt) }}</text>
          </view>
          <view class="cardkey-row" v-if="cardKeyInfo.daysRemaining !== undefined && !cardKeyInfo.isExpired">
            <text class="cardkey-label">剩余天数</text>
            <text class="cardkey-value">{{ cardKeyInfo.daysRemaining }} 天</text>
          </view>
        </view>
        
        <view class="stats">
          <view class="stat-item" @click="goPage('/pages/points/points')">
            <text class="stat-value">{{ points || 0 }}</text>
            <text class="stat-label">积分</text>
          </view>
          <view class="stat-item" @click="goPage('/pages/favorites/favorites')">
            <text class="stat-value">{{ favoriteCount || 0 }}</text>
            <text class="stat-label">收藏</text>
          </view>
          <view class="stat-item" @click="goPage('/pages/history/history')">
            <text class="stat-value">{{ playCount || 0 }}</text>
            <text class="stat-label">观看</text>
          </view>
        </view>
      </view>
      <view class="user-card" v-else @click="goLogin">
        <text class="login-text">点击登录</text>
      </view>

      <view class="menu-section">
        <text class="section-title">会员中心</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/points/points')">
            <text>积分兑换</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" @click="goPage('/pages/invitation/invitation')">
            <text>邀请好友</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" @click="goPage('/pages/cardkey/cardkey')">
            <text>卡密充值</text>
            <text class="arrow">&gt;</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <text class="section-title">我的内容</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/favorites/favorites')">
            <text>我的收藏</text>
            <view class="item-extra">
              <text class="item-count" v-if="favoriteCount > 0">{{ favoriteCount }}</text>
              <text class="arrow">&gt;</text>
            </view>
          </view>
          <view class="menu-item" @click="goPage('/pages/history/history')">
            <text>观看历史</text>
            <view class="item-extra">
              <text class="item-count" v-if="playCount > 0">{{ playCount }}</text>
              <text class="arrow">&gt;</text>
            </view>
          </view>
          </view>
          <view class="menu-item" @click="goPage('/pages/history/history')">
            <text>观看历史</text>
            <view class="item-extra">
              <text class="item-count" v-if="playCount > 0">{{ playCount }}</text>
              <text class="arrow">&gt;</text>
            </view>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <text class="section-title">设置</text>
        <view class="menu-list">
          <view class="menu-item" @click="goPage('/pages/settings/settings')">
            <text>设置</text>
            <text class="arrow">&gt;</text>
          </view>
          <view class="menu-item" v-if="userInfo" @click="changePassword">
            <text>修改密码</text>
            <text class="arrow">&gt;</text>
          </view>
        </view>
      </view>

      <view class="logout-btn" v-if="userInfo" @click="logout">
        <text>退出登录</text>
      </view>
      
      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script>
import { getApiUrl } from '../../utils/config'
export default {
  data() {
    return {
      userInfo: null,
      points: 0,
      favoriteCount: 0,
      playCount: 0,
      cardKeyInfo: null
    }
  },
  onShow() {
    console.log('[Mine] onShow called')
    this.userInfo = uni.getStorageSync('userInfo')
      console.log('[Mine] userInfo from storage:', this.userInfo)
      console.log('[Mine] current data state:', {
        points: this.points,
        favoriteCount: this.favoriteCount,
        playCount: this.playCount,
        cardKeyInfo: this.cardKeyInfo
      })
      if (this.userInfo) {
      this.loadUserData()
    } else {
      console.log('[Mine] user not logged in')
    }
  },
  methods: {
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    goPage(url) {
      if (!this.userInfo && url !== '/pages/settings/settings') {
        uni.navigateTo({ url: '/pages/login/login' })
        return
      }
      uni.navigateTo({ url: url })
    },
    loadUserData() {
      console.log('[Mine] loadUserData called')
      const userCookie = uni.getStorageSync('user_cookie')
      console.log('[Mine] userCookie:', userCookie)
      
      // 加载用户统计
      uni.request({
        url: getApiUrl('/api/user/my-stats'),
        withCredentials: true,
        success: (res) => {
          console.log('[Mine] my-stats response:', res.statusCode, res.data)
          console.log('[Mine] totalPlays:', res.data?.totalPlays)
          if (res.statusCode === 200 && res.data) {
            this.playCount = res.data.totalPlays || 0
            console.log('[Mine] set playCount to:', this.playCount)
          }
        },
        fail: (err) => {
          console.log('[Mine] my-stats failed:', err)
        }
      })
      
      // 加载积分
      uni.request({
        url: getApiUrl('/api/points/balance'),
        withCredentials: true,
        success: (res) => {
          console.log('[Mine] points-balance response:', res.statusCode, res.data)
          console.log('[Mine] balance:', res.data?.balance)
          if (res.statusCode === 200 && res.data) {
            this.points = res.data.balance || 0
            console.log('[Mine] set points to:', this.points)
          }
        },
        fail: (err) => {
          console.log('[Mine] points-balance failed:', err)
        }
      })
      
      // 加载收藏
      uni.request({
        url: getApiUrl('/api/favorites'),
        withCredentials: true,
        success: (res) => {
          console.log('[Mine] favorites response:', res.statusCode, res.data)
          if (res.data) {
            if (Array.isArray(res.data)) {
              this.favoriteCount = res.data.length
            } else if (res.data.list) {
              this.favoriteCount = res.data.list.length
            } else if (res.data.favorites) {
              this.favoriteCount = res.data.favorites.length
            } else {
              this.favoriteCount = Object.keys(res.data).length
            }
          }
        },
        fail: (err) => {
          console.log('[Mine] favorites failed:', err)
        }
      })
      
      // 加载观看记录数量
      uni.request({
        url: getApiUrl('/api/playrecords'),
        withCredentials: true,
        success: (res) => {
          console.log('[Mine] playrecords response:', res.statusCode, res.data)
          if (res.data) {
            if (Array.isArray(res.data)) {
              this.playCount = res.data.length
            } else if (res.data.list) {
              this.playCount = res.data.list.length
            } else if (res.data.records) {
              this.playCount = Array.isArray(res.data.records) ? res.data.records.length : Object.keys(res.data.records).length
            } else if (res.data.data && Array.isArray(res.data.data)) {
              this.playCount = res.data.data.length
            } else {
              this.playCount = Object.keys(res.data).length
            }
          }
        },
        fail: (err) => {
          console.log('[Mine] playrecords failed:', err)
        }
      })
      
      // 加载卡密信息
      uni.request({
        url: getApiUrl('/api/user/cardkey'),
        withCredentials: true,
        success: (res) => {
          console.log('[Mine] cardkey response:', res.statusCode, res.data)
          if (res.data && res.data.hasCardKey && res.data.cardKeyInfo) {
            this.cardKeyInfo = res.data.cardKeyInfo
          }
        },
        fail: (err) => {
          console.log('[Mine] cardkey failed:', err)
        }
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000
      const date = new Date(ts)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}`
    },
    changePassword() {
      uni.showModal({
        title: '修改密码',
        editable: true,
        placeholderText: '请输入新密码',
        success: (modalRes) => {
          if (modalRes.confirm && modalRes.content) {
            uni.request({
              url: getApiUrl('/api/change-password'),
              method: 'POST',
              data: { newPassword: modalRes.content },
              withCredentials: true,
              success: (res) => {
                if (res.data && res.data.ok) {
                  uni.showToast({ title: '修改成功', icon: 'success' })
                } else {
                  uni.showToast({ title: res.data?.error || '修改失败', icon: 'none' })
                }
              },
              fail: () => {
                uni.showToast({ title: '请求失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('user_cookie')
            this.userInfo = null
            uni.showToast({ title: '已退出' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/login' })
            }, 500)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/common.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 24rpx;
  padding-top: calc(24rpx + constant(safe-area-inset-top));
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $color-bg-secondary;
}

.header-title {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 24rpx;
}

.user-card {
  padding: 32rpx;
  background: $color-bg-secondary;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.username {
  color: $color-text;
  font-size: 36rpx;
  font-weight: bold;
}

.vip-badge {
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  border-radius: 16rpx;
  
  text {
    color: $color-bg;
    font-size: 22rpx;
    font-weight: bold;
  }
}

.cardkey-info {
  padding: 16rpx;
  background: rgba(#ffd700, 0.1);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.cardkey-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.cardkey-label {
  color: $color-text-secondary;
  font-size: 26rpx;
}

.cardkey-value {
  color: $color-text;
  font-size: 26rpx;
  
  &.active {
    color: $color-secondary;
  }
}

.login-text {
  color: $color-primary;
  font-size: 32rpx;
  text-align: center;
  display: block;
}

.stats {
  display: flex;
  margin-top: 16rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  
  &:active {
    opacity: 0.8;
  }
}

.stat-value {
  color: $color-text;
  font-size: 36rpx;
  display: block;
}

.stat-label {
  color: $color-text-muted;
  font-size: 24rpx;
}

.menu-section {
  margin-bottom: 24rpx;
}

.section-title {
  color: $color-text-muted;
  font-size: 26rpx;
  margin-bottom: 12rpx;
  display: block;
}

.menu-list {
  background: $color-bg-secondary;
  border-radius: 16rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid $color-border;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
  
  text {
    color: $color-text;
    font-size: 30rpx;
  }
}

.item-extra {
  display: flex;
  align-items: center;
}

.item-count {
  color: $color-text-muted;
  font-size: 26rpx;
  margin-right: 16rpx;
}

.arrow {
  color: $color-text-muted;
}

.logout-btn {
  margin-top: 48rpx;
  padding: 28rpx;
  background: $color-bg-secondary;
  border-radius: 16rpx;
  text-align: center;
  
  &:active {
    opacity: 0.8;
  }
  
  text {
    color: $color-primary;
    font-size: 30rpx;
  }
}

@media screen and (min-width: 768px) {
  .content {
    max-width: 750rpx;
    margin: 0 auto;
  }
}
</style>
