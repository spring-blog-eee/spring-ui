import axios from 'axios'

export const userApi = {
  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.get('/api/user/me', { headers })
  },
  updateUser(params)
  {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.post('/api/user/update', params, { headers })
  },
  updateAvatar(params)
  {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.post('/api/user/update-avatar', params, { headers })
  },
}