export const config = {
  baseUrl: '',
  serverUrl: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

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
  return path
}
