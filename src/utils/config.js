export const config = {
  baseUrl: '',
  serverUrl: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

export const API_BASE_URL = 'http://47.113.227.252:3000'

export const setBaseUrl = (url) => {
  config.baseUrl = url
}

export const getBaseUrl = () => {
  return config.baseUrl
}

export const getServerUrl = () => {
  return config.serverUrl || uni.getStorageSync('serverUrl') || ''
}

export const setServerUrl = (url) => {
  config.serverUrl = url
  uni.setStorageSync('serverUrl', url)
}

export const getApiUrl = (path) => {
  if (path.startsWith('http')) {
    return path
  }
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const host = window.location.host
    if (host.includes('monkeycode-ai.online') || host.includes('localhost')) {
      return path
    }
  }
  // #endif
  return API_BASE_URL + path
}
