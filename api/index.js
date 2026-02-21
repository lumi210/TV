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
  getHome(params) {
    return request.get('/api/douban', params)
  },

  search(params) {
    return request.get('/api/search', params)
  },

  getDetail(id, type = 'movie') {
    return request.get(`/api/detail/${type}/${id}`)
  },

  getCategories(type = 'movie') {
    return request.get(`/api/douban/categories`, { type })
  },

  getByCategory(params) {
    return request.get('/api/douban/category', params)
  }
}

export const playApi = {
  getPlayInfo(id, episode = 1) {
    return request.get('/api/play', { id, episode })
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
  getLiveList(params) {
    return request.get('/api/live', params)
  },

  getEpg(channelId) {
    return request.get(`/api/live/epg/${channelId}`)
  }
}

export const shortDramaApi = {
  getDramaList(params) {
    return request.get('/api/shortdrama', params)
  },

  getDramaDetail(id) {
    return request.get(`/api/shortdrama/${id}`)
  },

  searchDrama(params) {
    return request.get('/api/shortdrama/search', params)
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
