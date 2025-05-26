import api from './axios'
import axios from 'axios'

export const userApi = {
  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: token } : {}
    return axios.get('/api/user/me', { headers })
  },
  
  // Update user profile
  updateProfile(userData) {
    return api.put('/user/me', userData)
  },
  
  // Change password
  changePassword(passwords) {
    return api.post('/users/change-password', passwords)
  },
  
  // Admin: Get all users
  getAllUsers(params) {
    return api.get('/admin/users', { params })
  },
  
  // Admin: Get user by ID
  getUserById(id) {
    return api.get(`/admin/users/${id}`)
  },
  
  // Admin: Update user
  updateUser(id, userData) {
    return api.put(`/admin/users/${id}`, userData)
  },
  
  // Admin: Ban user
  banUser(id) {
    return api.post(`/admin/users/${id}/ban`)
  },
  
  // Admin: Unban user
  unbanUser(id) {
    return api.post(`/admin/users/${id}/unban`)
  }
}