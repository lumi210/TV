<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">
        <text>&lt;</text>
      </view>
      <text class="header-title">注册</text>
    </view>

    <view class="content">
      <view class="form">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" v-model="password" placeholder="请输入密码" :password="true" />
        </view>
        <view class="form-item">
          <text class="label">确认密码</text>
          <input class="input" v-model="password2" placeholder="请再次输入密码" :password="true" />
        </view>
        <view class="form-item">
          <text class="label">邀请码（选填）</text>
          <input class="input" v-model="inviteCode" placeholder="请输入邀请码" />
        </view>

        <button class="register-btn" :loading="loading" @click="handleRegister">注册</button>

        <view class="login-link" @click="goLogin">
          <text>已有账号？立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      password2: '',
      inviteCode: '',
      loading: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    handleRegister() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!this.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      if (this.password !== this.password2) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }

      this.loading = true

      uni.request({
        url: '/api/register',
        method: 'POST',
        data: {
          username: this.username,
          password: this.password,
          inviteCode: this.inviteCode
        },
        withCredentials: true,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.ok) {
            uni.showToast({ title: '注册成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/login' })
            }, 1000)
          } else {
            uni.showToast({ title: res.data?.error || '注册失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '网络错误', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
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
  padding: 32rpx;
}

.form {
  background: #1a1a2e;
  border-radius: 16rpx;
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 16rpx;
  display: block;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #0f0f1a;
  border-radius: 12rpx;
  color: #fff;
  font-size: 30rpx;
  box-sizing: border-box;
}

.register-btn {
  width: 100%;
  height: 96rpx;
  background: #ff6b6b;
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  margin-top: 16rpx;
}

.login-link {
  text-align: center;
  margin-top: 32rpx;
}

.login-link text {
  color: #ff6b6b;
  font-size: 26rpx;
}
</style>
