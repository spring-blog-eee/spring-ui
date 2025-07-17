import axios from 'axios'

export const userApi = {
  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.get('/api/user/me', { headers })
  },
}