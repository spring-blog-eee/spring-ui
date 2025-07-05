import axios from 'axios'
import Cookies from 'js-cookie'
import router from '../router'
import { useUserStore } from '../stores/user'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const aiBaseURL = 'http://localhost:58070'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许跨域请求携带凭证
})

const ai = axios.create({
  aiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许跨域请求携带凭证
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null
    const errMsg = error.response?.data?.message || error.message

    // 处理不同类型的错误
    switch (status) {
      case 401: // 未授权或token过期
        const userStore = useUserStore()
        userStore.logout()
        if (router.currentRoute.value.name !== 'Login') {
          router.push({
            name: 'Login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        }
        break
      case 403: // 禁止访问
        console.error('Access forbidden:', errMsg)
        break
      case 404: // 资源不存在
        console.error('Resource not found:', errMsg)
        break
      case 500: // 服务器错误
        console.error('Server error:', errMsg)
        break
      default: // 其他错误（包括网络错误等）
        if (!status) {
          console.error('Network error or CORS issue:', errMsg)
        }
        break
    }
    
    return Promise.reject(error)
  }
)

export default api