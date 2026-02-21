import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(uni.getStorageSync('userInfo') || null)
  const userCookie = ref(uni.getStorageSync('user_cookie') || '')

  const isLoggedIn = computed(() => !!userCookie.value)
  const username = computed(() => userInfo.value?.username || '')
  const isAdmin = computed(() => userInfo.value?.isAdmin || false)

  const setUserInfo = (info) => {
    userInfo.value = info
    uni.setStorageSync('userInfo', info)
  }

  const login = async (loginData) => {
    try {
      const res = await authApi.login(loginData)
      if (res.ok) {
        const cookie = uni.getStorageSync('user_cookie')
        userCookie.value = cookie
        setUserInfo({ 
          username: loginData.username || 'user',
          loginTime: Date.now()
        })
        return { success: true }
      }
      return { success: false, message: res.error || '登录失败' }
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
      userCookie.value = ''
      userInfo.value = null
      uni.removeStorageSync('user_cookie')
      uni.removeStorageSync('userInfo')
    }
  }

  const fetchUserInfo = async () => {
    if (!userCookie.value) return null
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
    userInfo,
    userCookie,
    isLoggedIn,
    username,
    isAdmin,
    setUserInfo,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
