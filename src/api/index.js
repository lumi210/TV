import request from '../utils/request'

export const authApi = {
  login(data) {
    return request.post('/api/login', data)
  },

  register(data) {
    return request.post('/api/register', data)
  },

  logout() {
    return request.post('/api/logout')
  },

  getUserInfo() {
    return request.get('/api/user')
  },

  updateUserInfo(data) {
    return request.put('/api/user', data)
  },

  changePassword(data) {
    return request.post('/api/change-password', data)
  }
}

export const doubanApi = {
  getMovies(tag = '热门', pageStart = 0, pageSize = 16) {
    return request.get('/api/douban', { type: 'movie', tag, pageStart, pageSize })
  },

  getTvShows(tag = '热门', pageStart = 0, pageSize = 16) {
    return request.get('/api/douban', { type: 'tv', tag, pageStart, pageSize })
  },

  search(params) {
    return request.get('/api/search', params)
  },

  getDetail(id, type = 'movie') {
    return request.get(`/api/detail/${type}/${id}`)
  }
}

export const playApi = {
  getPlayInfo(id, episode = 1) {
    return request.get('/api/detail', { id, episode })
  },

  getPlayRecords() {
    return request.get('/api/playrecords')
  },

  savePlayRecord(data) {
    return request.post('/api/playrecords', data)
  },

  deletePlayRecord(id) {
    return request.delete(`/api/playrecords/${id}`)
  }
}

export const favoriteApi = {
  getFavorites(params) {
    return request.get('/api/favorites', params)
  },

  addFavorite(data) {
    return request.post('/api/favorites', data)
  },

  removeFavorite(id) {
    return request.delete(`/api/favorites/${id}`)
  },

  checkFavorite(id) {
    return request.get(`/api/favorites/check/${id}`)
  }
}

export const liveApi = {
  getSources() {
    return request.get('/api/live/sources')
  },

  getChannels(source) {
    return request.get('/api/live/channels', { source })
  },

  getEpg(channelId) {
    return request.get(`/api/live/epg`, { channel: channelId })
  }
}

export const shortDramaApi = {
  getList(page = 1, size = 20) {
    return request.get('/api/shortdrama/list', { page, size })
  },

  getDetail(id) {
    return request.get(`/api/shortdrama/detail`, { id })
  },

  search(params) {
    return request.get('/api/shortdrama/search', params)
  },

  getCategories() {
    return request.get('/api/shortdrama/categories')
  }
}

export const aiApi = {
  getRecommend(params) {
    return request.post('/api/ai-recommend', params)
  }
}

export const userApi = {
  getPoints() {
    return request.get('/api/points')
  },

  getInvitationInfo() {
    return request.get('/api/invitation')
  },

  getSettings() {
    return request.get('/api/user/settings')
  },

  updateSettings(data) {
    return request.put('/api/user/settings', data)
  }
}
