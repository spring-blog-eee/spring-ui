import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const prefersDark = usePreferredDark()
  const storedTheme = localStorage.getItem('theme')
  
  // Initialize theme based on stored preference or system preference
  const isDark = ref(
    storedTheme ? storedTheme === 'dark' : prefersDark.value
  )
  
  // Toggle theme
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  
  // Set theme directly
  function setTheme(dark) {
    isDark.value = dark
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  
  // Watch for system preference changes
  watch(prefersDark, (newValue) => {
    // Only update if user hasn't explicitly set a preference
    if (!storedTheme) {
      isDark.value = newValue
    }
  })
  
  return {
    isDark,
    toggleTheme,
    setTheme
  }
})