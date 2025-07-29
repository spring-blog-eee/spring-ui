import axios from 'axios'

const prefix = '/api/account/user'

export const userApi = {
  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.get(prefix + '/me', { headers })
  },
  updateUser(params)
  {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.post(prefix + '/update', params, { headers })
  },
  updateAvatar(params)
  {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.post(prefix + '/avatar', params, { headers })
  },
}