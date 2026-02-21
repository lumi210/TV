import { config } from './config'

class Request {
  constructor() {
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout
  }

  setBaseUrl(url) {
    this.baseUrl = url
  }

  request(options = {}) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      const url = options.url.startsWith('http') ? options.url : this.baseUrl + options.url
      
      uni.request({
        url: url,
        method: options.method || 'GET',
        data: options.data || {},
        timeout: options.timeout || this.timeout,
        header: {
          ...config.headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.showToast({ title: '请先登录', icon: 'none' })
            reject(new Error('未授权'))
          } else {
            const errorMsg = res.data?.error || res.data?.message || `请求失败(${res.statusCode})`
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err)
          reject(new Error(err.errMsg || '网络请求失败'))
        }
      })
    })
  }

  get(url, data, options = {}) {
    return this.request({ url, method: 'GET', data, ...options })
  }

  post(url, data, options = {}) {
    return this.request({ url, method: 'POST', data, ...options })
  }

  put(url, data, options = {}) {
    return this.request({ url, method: 'PUT', data, ...options })
  }

  delete(url, data, options = {}) {
    return this.request({ url, method: 'DELETE', data, ...options })
  }
}

export const request = new Request()

export default request
