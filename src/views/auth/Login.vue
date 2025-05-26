<template>
  <div class="auth-page">
    <div class="form-container">
      <h1 class="form-title">欢迎回来</h1>
      
      <!-- OAuth buttons -->
      <div class="oauth-buttons">
        <button class="oauth-button github-button" @click="handleOAuth('github')">
          <el-icon><Platform /></el-icon>
          GitHub
        </button>
        <button class="oauth-button google-button" @click="handleOAuth('google')">
          <el-icon><Connection /></el-icon>
          Google
        </button>
      </div>
      
      <div class="form-divider">
        <span class="form-divider-text">或使用邮箱继续</span>
      </div>
      
      <!-- Login form -->
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @submit.native.prevent="handleSubmit"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="邮箱"
            type="email"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            :type="showPassword ? 'text' : 'password'"
            prefix-icon="Lock"
          >
            <template #suffix>
              <el-icon class="password-toggle" @click="showPassword = !showPassword">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <div class="form-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <router-link to="/reset-password" class="forgot-password">
            忘记密码？
          </router-link>
        </div>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="submit-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        没有账号？
        <router-link to="/register" class="auth-link">
          注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

// Form data
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// Form validation rules
const rules = {
  email: [
    { required: true, message: '请输入您的邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入您的密码', trigger: 'blur' },
    { min: 6, message: '密码至少需要 6 个字符', trigger: 'blur' }
  ]
}

// Handle form submission
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await userStore.login({
      email: loginForm.email,
      password: loginForm.password,
      remember: loginForm.remember
    })
    
    if (success) {
      ElMessage.success('登录成功')
      
      // Redirect to intended page or home
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    } else {
      ElMessage.error(userStore.error || '登录失败')
    }
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    loading.value = false
  }
}

// Handle OAuth login
const handleOAuth = (provider) => {
  // In a real implementation, this would redirect to the OAuth provider
  // For demo purposes, we'll just show a message
  ElMessage.info(`${provider} 登录将重定向到认证页面`)
}
</script>

<style scoped>
.auth-page {
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.form-container {
  width: 100%;
  max-width: 400px; /* Adjust max-width as needed */
  padding: 2rem;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-password {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

:deep(.dark-mode) .auth-footer {
  color: #94a3b8;
}

.auth-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

.password-toggle {
  cursor: pointer;
}
</style>