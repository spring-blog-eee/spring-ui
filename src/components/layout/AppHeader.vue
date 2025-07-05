<template>
  <header class="app-header" :class="{ 'scrolled': scrolled, 'debug-mode': debugMode }">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <h1>SpringBlog</h1>
        </router-link>
      </div>
      
      <nav class="desktop-nav">
        <router-link to="/" class="nav-link" @click="debugClick('首页')">首页</router-link>
        <router-link to="/blog" class="nav-link" @click="debugClick('博客')">博客</router-link>
        <router-link to="/ai" class="nav-link" @click="debugClick('AI')">知识问答</router-link>
        <router-link to="/resource" class="nav-link" @click="debugClick('资料库')">资料库</router-link>
        
        <!-- Admin links -->
        <template v-if="userStore.isAdmin">
          <router-link to="/admin" class="nav-link" @click="debugClick('仪表盘')">仪表盘</router-link>
        </template>
      </nav>
      
      <div class="right-actions">
        
        <!-- Theme toggler -->
        <button class="theme-toggle" @click="handleThemeToggle">
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
          <router-link to="/login" class="auth-btn login-btn" @click="debugClick('登录')">登录</router-link>
          <router-link to="/register" class="auth-btn register-btn" @click="debugClick('注册')">注册</router-link>
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
const debugMode = ref(false)

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

// Handle click outside to close mobile menu
const handleClickOutside = (event) => {
  const header = event.target.closest('.app-header')
  if (!header && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

// Debug function to test click events
const debugClick = (elementName) => {
  console.log(`Clicked on: ${elementName}`)
}

// Handle theme toggle with debug
const handleThemeToggle = () => {
  debugClick('主题切换')
  themeStore.toggleTheme()
}

// Toggle debug mode
const toggleDebugMode = () => {
  debugMode.value = !debugMode.value
  console.log('Debug mode:', debugMode.value)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  handleScroll() // Check initial scroll position
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 0;
  transition: background-color 0.3s, box-shadow 0.3s;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.app-header.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 夜间模式下的导航栏样式 */
.dark-mode .app-header {
  background-color: rgba(20, 20, 20, 0.8);
}

.dark-mode .app-header.scrolled {
  background-color: rgba(20, 20, 20, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.logo a {
  text-decoration: none;
  color: #0288d1;
  font-weight: 700;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #4285f4 0%, #c084fc 100%);
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
  position: relative;
  z-index: 10;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
  pointer-events: auto;
  z-index: 1;
}

.dark-mode .nav-link {
  color: var(--el-text-color-primary);
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
  position: relative;
  z-index: 10;
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
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.dark-mode .theme-toggle {
  color: var(--el-text-color-primary);
}

.theme-toggle:hover {
  background-color: var(--el-fill-color-light);
}

.user-avatar {
  cursor: pointer;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.auth-btn {
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
  position: relative;
  z-index: 2;
  pointer-events: auto;
  display: inline-block;
  /* 确保按钮不会意外扩展 */
  width: auto;
  max-width: fit-content;
  flex-shrink: 0;
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
  color: #333;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.dark-mode .mobile-menu-btn {
  color: var(--el-text-color-primary);
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
  z-index: 999;
}

.dark-mode .mobile-nav {
  background-color: var(--el-bg-color);
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

@media (max-width: 480px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .right-actions .auth-btn {
    display: none;
  }
}

/* 确保桌面端元素在大屏幕上正常显示 */
@media (min-width: 481px) {
  .desktop-nav {
    display: flex !important;
  }
  
  .desktop-nav .nav-link {
    display: inline-block !important;
  }
  
  .right-actions .auth-btn {
    display: inline-block !important;
  }
}

@media (min-width: 481px) {
  .mobile-nav {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: none !important;
  }
}

/* 强制确保所有可点击元素都能响应点击 */
.nav-link {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 5 !important;
}

.auth-btn {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 5 !important;
  /* 确保按钮不会扩展超出其内容区域 */
  width: auto !important;
  max-width: fit-content !important;
}

.theme-toggle,
.mobile-menu-btn,
.user-avatar {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 5 !important;
}

/* Element Plus 图标修复 */
.el-icon {
  pointer-events: none !important;
}

/* 确保下拉菜单可以点击 */
.el-dropdown {
  pointer-events: auto !important;
  z-index: 10 !important;
}

.el-dropdown-menu {
  z-index: 2000 !important;
}

/* 调试样式 - 临时添加边框来查看点击区域 */
.debug-mode .nav-link {
  border: 2px solid red !important;
}

.debug-mode .auth-btn {
  border: 2px solid blue !important;
}

.debug-mode .theme-toggle {
  border: 2px solid green !important;
}

/* 确保没有其他元素覆盖 */
.app-header * {
  pointer-events: auto;
}

.app-header .el-icon {
  pointer-events: none;
}
</style>