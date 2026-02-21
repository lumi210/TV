export const config = {
  baseUrl: 'http://47.113.227.252:3000',
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
