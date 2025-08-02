import axios from 'axios';

const prefix = '/api/account/auth'

export const authApi = {
  // Login
  login(credentials) {
    return axios.post(prefix + '/login', credentials)
  },
  
  // Register
  register(userData) {
    return axios.post(prefix + '/register', userData)
  },
  
  // Request password reset
  sendVerifyCode(email) {
    return axios.get(prefix + `/mail/send/${email}`, { email })
  },
  
  // Reset password
  resetPassword(data) {
    return axios.post(prefix + '/reset', data)
  }
}