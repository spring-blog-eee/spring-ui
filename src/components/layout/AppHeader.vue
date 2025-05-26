<template>
  <header class="app-header" :class="{ 'scrolled': scrolled }">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <h1>BlogVue</h1>
        </router-link>
      </div>
      
      <nav class="desktop-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/blog" class="nav-link">博客</router-link>
        
        <!-- Admin links -->
        <template v-if="userStore.isAdmin">
          <router-link to="/admin" class="nav-link">仪表盘</router-link>
        </template>
      </nav>
      
      <div class="right-actions">
        <!-- Theme toggler -->
        <button class="theme-toggle" @click="themeStore.toggleTheme">
          <el-icon v-if="themeStore.isDark"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </button>
        
        <!-- User menu -->
        <template v-if="userStore.isLoggedIn">
          <el-dropdown trigger="click">
            <div class="user-avatar">
              <el-avatar :size="32" :src="userStore.user?.avatar || ''">
                {{ userAvatarFallback }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <router-link to="/profile" class="dropdown-link">个人资料</router-link>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <!-- Auth buttons -->
        <template v-else>
          <router-link to="/login" class="auth-btn login-btn">登录</router-link>
          <router-link to="/register" class="auth-btn register-btn">注册</router-link>
        </template>
      </div>
      
      <!-- Mobile menu button -->
      <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <el-icon v-if="isMobileMenuOpen"><Close /></el-icon>
        <el-icon v-else><Menu /></el-icon>
      </button>
      
      <!-- Mobile menu -->
      <div class="mobile-nav" :class="{ 'open': isMobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="isMobileMenuOpen = false">首页</router-link>
        <router-link to="/blog" class="nav-link" @click="isMobileMenuOpen = false">博客</router-link>
        
        <!-- Admin links -->
        <template v-if="userStore.isAdmin">
          <router-link to="/admin" class="nav-link" @click="isMobileMenuOpen = false">仪表盘</router-link>
        </template>
        
        <!-- Auth links -->
        <template v-if="!userStore.isLoggedIn">
          <router-link to="/login" class="nav-link" @click="isMobileMenuOpen = false">登录</router-link>
          <router-link to="/register" class="nav-link" @click="isMobileMenuOpen = false">注册</router-link>
        </template>
        
        <!-- User links -->
        <template v-else>
          <router-link to="/profile" class="nav-link" @click="isMobileMenuOpen = false">个人资料</router-link>
          <a href="#" class="nav-link" @click="handleMobileLogout">退出登录</a>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useThemeStore } from '../../stores/theme'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const scrolled = ref(false)
const isMobileMenuOpen = ref(false)

const userAvatarFallback = computed(() => {
  if (!userStore.user) return ''
  return userStore.user.name ? userStore.user.name.charAt(0).toUpperCase() : 'U'
})

// Handle scroll event for header style
const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

// Handle logout
const handleLogout = async () => {
  userStore.logout()
  ElMessage.success('Logged out successfully')
  router.push('/')
}

// Handle mobile logout
const handleMobileLogout = (e) => {
  e.preventDefault()
  handleLogout()
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 1rem 0;
  transition: background-color 0.3s, box-shadow 0.3s;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.app-header.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.dark-mode) .app-header {
  background-color: rgba(26, 26, 26, 0.8);
}

:deep(.dark-mode) .app-header.scrolled {
  background-color: rgba(26, 26, 26, 0.95);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  text-decoration: none;
  color: #0288d1;
  font-weight: 700;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  background-image: linear-gradient(to right, #a5d46b 0%, #1e1ee9 50%, #585923 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-animation 3s linear infinite;
}

@keyframes gradient-animation {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.desktop-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
}

:deep(.dark-mode) .nav-link {
  color: #f5f5f5;
}

.nav-link:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #0288d1;
  transition: width 0.3s;
}

.nav-link:hover:after,
.router-link-active:after {
  width: 100%;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: background-color 0.3s;
}

:deep(.dark-mode) .theme-toggle {
  color: #f5f5f5;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.dark-mode) .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  cursor: pointer;
}

.auth-btn {
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.login-btn {
  color: #0288d1;
}

.login-btn:hover {
  color: #0277bd;
}

.register-btn {
  background-color: #0288d1;
  color: white;
}

.register-btn:hover {
  background-color: #0277bd;
}

.dropdown-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-nav {
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
  flex-direction: column;
  z-index: 99;
}

:deep(.dark-mode) .mobile-nav {
  background-color: #1a1a1a;
}

.mobile-nav.open {
  transform: translateY(0);
  opacity: 1;
}

.mobile-nav .nav-link {
  padding: 0.75rem 1rem;
  display: block;
  text-align: center;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .auth-btn {
    display: none;
  }
}
</style>