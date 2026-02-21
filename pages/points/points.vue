<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">&lt;</view>
      <text class="header-title">我的积分</text>
    </view>
    <view class="content">
      <view class="points-card">
        <text class="points-label">当前积分</text>
        <text class="points-value">{{ points }}</text>
      </view>
      <view class="section">
        <text class="section-title">积分规则</text>
        <text class="rule-text">1. 每日签到可获得积分</text>
        <text class="rule-text">2. 邀请好友注册获得积分</text>
        <text class="rule-text">3. 积分可用于兑换会员特权</text>
      </view>
      <view class="section">
        <text class="section-title">积分记录</text>
        <view class="list">
          <view class="item" v-for="(item, index) in records" :key="index">
            <view class="item-info">
              <text class="item-title">{{ item.desc || item.type }}</text>
              <text class="item-time">{{ item.time }}</text>
            </view>
            <text class="item-points" :class="{ minus: item.points < 0 }">{{ item.points > 0 ? '+' : '' }}{{ item.points }}</text>
          </view>
        </view>
        <view class="empty" v-if="records.length === 0">
          <text>暂无积分记录</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() { return { points: 0, records: [] } },
  onShow() { this.loadData() },
  methods: {
    goBack() { uni.navigateBack() },
    loadData() {
      uni.request({
        url: '/api/user/my-stats',
        withCredentials: true,
        success: (res) => {
          if (res.data) {
            this.points = res.data.points || 0
            this.records = res.data.pointsHistory || []
          }
        }
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
.points-card { padding: 48rpx; background: linear-gradient(135deg, #ff6b6b, #ff8e8e); border-radius: 16rpx; text-align: center; margin-bottom: 24rpx; }
.points-label { color: rgba(255,255,255,0.8); font-size: 28rpx; }
.points-value { color: #fff; font-size: 64rpx; font-weight: bold; display: block; margin-top: 16rpx; }
.section { background: #1a1a2e; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.section-title { color: #fff; font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; display: block; }
.rule-text { color: #aaa; font-size: 26rpx; display: block; margin-bottom: 12rpx; }
.item { display: flex; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #2d2d44; }
.item:last-child { border-bottom: none; }
.item-info { flex: 1; }
.item-title { color: #fff; font-size: 28rpx; display: block; }
.item-time { color: #888; font-size: 24rpx; }
.item-points { color: #4ecdc4; font-size: 28rpx; font-weight: bold; }
.item-points.minus { color: #ff6b6b; }
.empty { padding: 48rpx; text-align: center; }
.empty text { color: #888; }
</style>
