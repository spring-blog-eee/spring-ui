<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container" :class="{ 'dark-mode': isDark }">
      <AppHeader />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const isDark = computed(() => themeStore.isDark)

onMounted(() => {
  // 检查用户登录状态
  if(localStorage.getItem('token')) {
    userStore.token = localStorage.getItem('token')
  }
  console.log('token', userStore.token)
  if (userStore.token) {
    userStore.fetchUser()
  }
})
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #f5f5f5;
}
</style>