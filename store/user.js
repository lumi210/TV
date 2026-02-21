import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') || null)

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const isAdmin = computed(() => userInfo.value?.isAdmin || false)

  const setToken = (newToken) => {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    uni.setStorageSync('userInfo', info)
  }

  const login = async (loginData) => {
    try {
      const res = await authApi.login(loginData)
      if (res.token) {
        setToken(res.token)
        setUserInfo(res.user)
        return { success: true }
      }
      return { success: false, message: res.message || '登录失败' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const register = async (registerData) => {
    try {
      const res = await authApi.register(registerData)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error('logout error:', e)
    } finally {
      token.value = ''
      userInfo.value = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }

  const fetchUserInfo = async () => {
    if (!token.value) return null
    try {
      const res = await authApi.getUserInfo()
      setUserInfo(res)
      return res
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    isAdmin,
    setToken,
    setUserInfo,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
