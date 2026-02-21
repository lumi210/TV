export const config = {
  baseUrl: '',
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
