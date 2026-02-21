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
      const url = options.url.startsWith('http') ? options.url : this.baseUrl + options.url
      
      const savedCookie = uni.getStorageSync('user_cookie') || ''
      
      console.log('[Request]', options.method || 'GET', url)
      if (savedCookie) {
        console.log('[Cookie]', savedCookie.substring(0, 50) + '...')
      }
      
      uni.request({
        url: url,
        method: options.method || 'GET',
        data: options.data || {},
        timeout: options.timeout || this.timeout,
        withCredentials: true,
        header: {
          ...config.headers,
          ...(savedCookie ? { 'Cookie': savedCookie } : {}),
          ...options.header
        },
        success: (res) => {
          console.log('[Response]', res.statusCode, JSON.stringify(res.data).substring(0, 200))
          
          const headers = res.header || {}
          const setCookie = headers['set-cookie'] || headers['Set-Cookie']
          
          if (setCookie) {
            let cookieValue = ''
            if (Array.isArray(setCookie)) {
              cookieValue = setCookie.map(c => c.split(';')[0]).join('; ')
            } else {
              cookieValue = setCookie.split(';')[0]
            }
            if (cookieValue.includes('user_auth')) {
              uni.setStorageSync('user_cookie', cookieValue)
              console.log('[Cookie Saved]')
            }
          }
          
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            uni.removeStorageSync('user_cookie')
            uni.removeStorageSync('userInfo')
            reject(new Error('未授权，请先登录'))
          } else {
            const errorMsg = res.data?.error || res.data?.message || `请求失败(${res.statusCode})`
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('[Request Failed]', err)
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
