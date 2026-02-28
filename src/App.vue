<script>
import { checkAndUpdateOnLaunch } from './utils/hot-update'

export default {
  onLaunch() {
    console.log('App Launch')
    // H5 环境下不设置导航栏颜色
    // #ifndef H5
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0f0f1a'
    })
    
    // 检查热更新
    checkAndUpdateOnLaunch()
    // #endif
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #0f0f1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 强制电视模式：将768px+的样式应用到所有屏幕 */
/* 导航栏适配 */
.custom-navbar {
  height: 100rpx !important;
  padding: 0 32rpx !important;
}

.navbar-title {
  font-size: 40rpx !important;
}

.navbar-search {
  height: 70rpx !important;
}

/* Hero Banner 适配 */
.hero-banner {
  height: 56.25vw !important;
  max-height: 800rpx !important;
  min-height: 450rpx !important;
}

.hero-title {
  font-size: 48rpx !important;
}

.hero-btn {
  padding: 20rpx 48rpx !important;
  font-size: 32rpx !important;
}

/* 视频卡片适配 */
.video-card {
  width: 280rpx !important;
}

.video-poster-wrap {
  width: 280rpx !important;
  height: 392rpx !important;
}

.video-title {
  font-size: 28rpx !important;
}

/* 章节按钮适配 */
.episode-btn {
  min-width: 140rpx !important;
  height: 80rpx !important;
  padding: 0 24rpx !important;
  font-size: 28rpx !important;
}

/* 输入框适配 */
.input {
  height: 100rpx !important;
  font-size: 32rpx !important;
}

/* 列表项适配 */
.list-item {
  padding: 32rpx 0 !important;
}

/* 底部导航栏适配 */
.tab-bar {
  height: 120rpx !important;
}

.tab-bar-item {
  height: 120rpx !important;
}

.tab-bar-icon {
  font-size: 48rpx !important;
}

.tab-bar-text {
  font-size: 28rpx !important;
}

/* 焦点管理样式 */
.tv-focusable {
  transition: all 0.2s ease;
  outline: none;
}

.tv-focusable:focus {
  transform: scale(1.05);
  box-shadow: 0 0 0 4rpx rgba(255, 107, 107, 0.6);
}

.tv-focus {
  transform: scale(1.08);
  box-shadow: 0 0 0 6rpx rgba(255, 107, 107, 0.8);
  z-index: 10;
}

/* 浮动搜索按钮 - 电视模式下隐藏 */
.float-search {
  display: none !important;
}

/* 播放页面适配 */
.player-controls {
  height: 120rpx !important;
}

.control-btn {
  width: 80rpx !important;
  height: 80rpx !important;
  font-size: 40rpx !important;
}

.progress-bar {
  height: 8rpx !important;
}

/* 直播页面适配 */
.channel-item {
  padding: 24rpx 32rpx !important;
}

.channel-name {
  font-size: 32rpx !important;
}

.channel-logo {
  width: 120rpx !important;
  height: 120rpx !important;
}

/* 搜索页面适配 */
.search-input {
  height: 100rpx !important;
  font-size: 32rpx !important;
}

.search-result-item {
  padding: 32rpx !important;
}

/* 用户中心页面适配 */
.user-info {
  padding: 48rpx 32rpx !important;
}

.user-avatar {
  width: 160rpx !important;
  height: 160rpx !important;
}

.user-name {
  font-size: 40rpx !important;
}

.menu-item {
  height: 100rpx !important;
  padding: 0 32rpx !important;
}

.menu-text {
  font-size: 32rpx !important;
}

/* 设置页面适配 */
.setting-item {
  padding: 32rpx !important;
}

.setting-label {
  font-size: 32rpx !important;
}

.setting-value {
  font-size: 28rpx !important;
}

/* 登录注册页面适配 */
.auth-container {
  padding: 80rpx 48rpx !important;
}

.auth-title {
  font-size: 48rpx !important;
}

.auth-btn {
  height: 100rpx !important;
  font-size: 36rpx !important;
}

/* 加载更多按钮 */
.load-more-btn {
  width: 500rpx !important;
  height: 100rpx !important;
  font-size: 32rpx !important;
  margin: 32rpx auto;
}

/* 模态框适配 */
.modal {
  max-width: 800rpx !important;
}

.modal-title {
  font-size: 40rpx !important;
}

.modal-content {
  font-size: 32rpx !important;
  padding: 32rpx !important;
}

.modal-btn {
  height: 90rpx !important;
  font-size: 32rpx !important;
  min-width: 200rpx !important;
}

/* Toast 提示适配 */
.toast {
  font-size: 32rpx !important;
  padding: 24rpx 48rpx !important;
  border-radius: 48rpx !important;
}

/* 加载动画优化 */
.loading-spinner {
  width: 60rpx !important;
  height: 60rpx !important;
}

/* 可滚动区域优化 */
.scroll-x {
  scroll-behavior: smooth;
}

/* 安全区域适配 */
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 文字省略 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 清除按钮默认样式 */
button {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  line-height: inherit;
}

button::after {
  border: none;
}

/* 输入框默认样式 */
input {
  box-sizing: border-box;
}

input::placeholder {
  color: #666666;
}

/* 滚动条隐藏 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 图片默认样式 */
image {
  background-color: #1a1a2e;
}

/* flex 布局工具类 */
.flex {
  display: flex;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
}

/* 间距工具类 */
.p-24 {
  padding: 24rpx;
}

.pt-safe {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.pb-safe {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
