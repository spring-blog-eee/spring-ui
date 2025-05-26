import axios from 'axios';

export const authApi = {
  // Login
  login(credentials) {
    return axios.post('api/auth/login', credentials)
  },
  
  // Register
  register(userData) {
    return axios.post('api/auth/register', userData)
  },
  
  // Request password reset
  sendVerifyCode(email) {
    return axios.get(`api/auth/mail/send/${email}`, { email })
  },
  
  // Reset password
  resetPassword(data) {
    return axios.post('/auth/reset-password', data)
  },
  
  // Verify email
  verifyEmail(token) {
    return axios.post('/auth/verify-email', { token })
  },
  
  // OAuth login
  oauthLogin(provider, code) {
    return axios.post(`/auth/oauth/${provider}`, { code })
  },
  
  // Send verification code
  sendVerificationCode(email) {
    return axios.get(`/auth/mail/send/${email}`)
  },
  
  // Verify code
  verifyCode(email, code) {
    return axios.post('/auth/verify-code', { email, code })
  }
}