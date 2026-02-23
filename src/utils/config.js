export const config = {
  baseUrl: '',
  serverUrl: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// App 端后端地址（打包 App 时使用）
export const APP_API_BASE = 'https://oa.fushanhn.com'

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
  return path
  // #endif
  
  // #ifndef H5
  // App 端使用完整地址
  return APP_API_BASE + path
  // #endif
}
