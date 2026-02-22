<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="header-title">邀请好友</text>
    </view>
    <view class="content">
      <view class="card">
        <text class="card-title">我的邀请码</text>
        <text class="invite-code">{{ inviteCode || '暂无邀请码' }}</text>
        <button class="copy-btn" v-if="inviteCode" @click="copyCode">复制邀请码</button>
      </view>
      <view class="section">
        <text class="section-title">邀请规则</text>
        <text class="rule-text">1. 分享您的邀请码给好友</text>
        <text class="rule-text">2. 好友注册时填写您的邀请码</text>
        <text class="rule-text">3. 双方均可获得积分奖励</text>
      </view>
      <view class="section">
        <text class="section-title">邀请记录</text>
        <view class="list">
          <view class="item" v-for="(item, index) in records" :key="index">
            <text class="item-name">{{ item.username }}</text>
            <text class="item-time">{{ item.time }}</text>
          </view>
        </view>
        <view class="empty" v-if="records.length === 0">
          <text>暂无邀请记录</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() { return { inviteCode: '', records: [] } },
  onShow() { this.loadData() },
  methods: {
    goBack() { uni.navigateBack() },
    loadData() {
      uni.request({
        url: '/api/invitation/info',
        withCredentials: true,
        success: (res) => {
          if (res.data && !res.data.error) {
            this.inviteCode = res.data.inviteCode || res.data.code || ''
            this.records = res.data.records || res.data.history || []
          }
        }
      })
    },
    copyCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => { uni.showToast({ title: '已复制' }) }
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
.card { padding: 48rpx; background: #1a1a2e; border-radius: 16rpx; text-align: center; margin-bottom: 24rpx; }
.card-title { color: #888; font-size: 28rpx; }
.invite-code { color: #ff6b6b; font-size: 48rpx; font-weight: bold; display: block; margin: 24rpx 0; }
.copy-btn { background: #ff6b6b; color: #fff; padding: 16rpx 48rpx; border-radius: 24rpx; font-size: 28rpx; }
.section { background: #1a1a2e; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.section-title { color: #fff; font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; display: block; }
.rule-text { color: #aaa; font-size: 26rpx; display: block; margin-bottom: 12rpx; }
.list { }
.item { display: flex; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #2d2d44; }
.item:last-child { border-bottom: none; }
.item-name { color: #fff; font-size: 28rpx; }
.item-time { color: #888; font-size: 24rpx; }
.empty { padding: 32rpx; text-align: center; }
.empty text { color: #888; }
</style>
