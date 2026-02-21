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
      
      uni.request({
        url: options.url.startsWith('http') ? options.url : this.baseUrl + options.url,
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
            uni.navigateTo({ url: '/pages/login/login' })
            reject(new Error('登录已过期，请重新登录'))
          } else {
            reject(new Error(res.data?.message || '请求失败'))
          }
        },
        fail: (err) => {
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
