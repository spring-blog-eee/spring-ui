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
  requestPasswordReset(email) {
    return axios.post(`/auth/mail/send/${email}`, { email })
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
    return axios.post('/auth/send-code', { email })
  },
  
  // Verify code
  verifyCode(email, code) {
    return axios.post('/auth/verify-code', { email, code })
  }
}