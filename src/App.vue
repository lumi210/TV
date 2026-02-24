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
