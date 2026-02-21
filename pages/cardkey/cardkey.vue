<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="header-title">卡密充值</text>
    </view>
    <view class="content">
      <view class="card">
        <text class="card-title">输入卡密</text>
        <input class="card-input" v-model="cardKey" placeholder="请输入卡密" />
        <button class="redeem-btn" @click="redeem">立即充值</button>
      </view>
      <view class="section" v-if="myCardKeys.length > 0">
        <text class="section-title">我的卡密</text>
        <view class="list">
          <view class="item" v-for="(item, index) in myCardKeys" :key="index">
            <view class="item-info">
              <text class="item-code">{{ item.cardKey }}</text>
              <text class="item-status">{{ item.status === 'used' ? '已使用' : '未使用' }}</text>
            </view>
            <text class="item-time">{{ item.createTime }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() { return { cardKey: '', myCardKeys: [] } },
  onShow() { this.loadMyCardKeys() },
  methods: {
    goBack() { uni.navigateBack() },
    loadMyCardKeys() {
      uni.request({
        url: '/api/cardkeys/my',
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.cardKeys) {
            this.myCardKeys = res.data.cardKeys
          }
        }
      })
    },
    redeem() {
      if (!this.cardKey) {
        uni.showToast({ title: '请输入卡密', icon: 'none' })
        return
      }
      uni.request({
        url: '/api/redeem',
        method: 'POST',
        data: { cardKey: this.cardKey },
        withCredentials: true,
        success: (res) => {
          if (res.data && res.data.ok) {
            uni.showToast({ title: '充值成功', icon: 'success' })
            this.cardKey = ''
            this.loadMyCardKeys()
          } else {
            uni.showToast({ title: res.data?.error || '充值失败', icon: 'none' })
          }
        },
        fail: () => { uni.showToast({ title: '请求失败', icon: 'none' }) }
      })
    }
  }
}
</script>
<style>
.page { height: 100vh; background: #0f0f1a; }
.header { display: flex; align-items: center; padding: 50rpx 24rpx 24rpx; background: #1a1a2e; }
.back { color: #fff; font-size: 36rpx; margin-right: 16rpx; }
.header-title { color: #fff; font-size: 36rpx; font-weight: bold; }
.content { padding: 24rpx; }
.card { padding: 32rpx; background: #1a1a2e; border-radius: 16rpx; margin-bottom: 24rpx; }
.card-title { color: #fff; font-size: 30rpx; margin-bottom: 24rpx; display: block; }
.card-input { width: 100%; height: 88rpx; padding: 0 24rpx; background: #0f0f1a; border-radius: 12rpx; color: #fff; font-size: 30rpx; box-sizing: border-box; }
.redeem-btn { width: 100%; height: 88rpx; background: #ff6b6b; color: #fff; font-size: 32rpx; border-radius: 12rpx; margin-top: 24rpx; }
.section { background: #1a1a2e; border-radius: 16rpx; padding: 24rpx; }
.section-title { color: #fff; font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; display: block; }
.item { padding: 20rpx 0; border-bottom: 1rpx solid #2d2d44; }
.item:last-child { border-bottom: none; }
.item-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.item-code { color: #fff; font-size: 28rpx; }
.item-status { color: #4ecdc4; font-size: 24rpx; }
.item-time { color: #888; font-size: 24rpx; }
</style>
