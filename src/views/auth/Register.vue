<template>
  <div class="auth-page">
    <div class="form-container">
      <h1 class="form-title">创建账户</h1>



      <!-- Registration form -->
      <el-form ref="formRef" :model="registerForm" :rules="rules" @submit.native.prevent="handleSubmit">
        <el-form-item prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="昵称" prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="邮箱" type="email" prefix-icon="Message" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" placeholder="密码" :type="showPassword ? 'text' : 'password'"
            prefix-icon="Lock">
            <template #suffix>
              <el-icon class="password-toggle" @click="showPassword = !showPassword">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" placeholder="确认密码"
            :type="showPassword ? 'text' : 'password'" prefix-icon="Lock" />
        </el-form-item>

        <el-form-item prop="inviteCode">
          <el-input v-model="registerForm.inviteCode" placeholder="邀请码 (管理员可选)"
            prefix-icon="Key" />
        </el-form-item>

        <el-form-item v-if="showVerification" prop="emailCode">
          <div class="verification-group">
            <el-input v-model="registerForm.emailCode" placeholder="验证码" prefix-icon="Check" />
            <el-button type="primary" :disabled="countdown > 0" @click="sendVerificationCode">
              {{ countdown > 0 ? `重新发送 ${countdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="registerForm.agreeTerms" label="我同意条款和隐私政策" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" :disabled="!registerForm.agreeTerms"
            class="submit-button">
            创建账户
          </el-button>
        </el-form-item>
        <div class="auth-footer">
          已有账户？
          <router-link to="/login" class="auth-link">
            登录
          </router-link>
        </div>
        <!-- OAuth buttons -->
      </el-form>
      <div class="oauth-buttons">
        <button class="oauth-button github-button" @click="handleOAuth('github')">
          <el-icon>
            <i-logos-github-icon />
          </el-icon>
          GitHub
        </button>
        <button class="oauth-button google-button" @click="handleOAuth('google')">
          <el-icon>
            <i-logos-google-icon />
          </el-icon>
          Google
        </button>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { authApi } from '../../api/auth'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const showVerification = ref(false)
const countdown = ref(0)

// Form data
const registerForm = reactive({
  email: '',
  password: '',
  nickname: '',
  emailCode: '',
  inviteCode: ''
})

// Form validation rules
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入您的密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认您的密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不匹配'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, message: '姓名至少需要2个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入您的邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码至少需要6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须是6位数字', trigger: 'blur' }
  ]
}

// Send verification code
const sendVerificationCode = async () => {
  try {
    // Validate email first
    await formRef.value.validateField('email')

    const response = await authApi.sendVerifyCode(registerForm.email)
    console.log(response)
    if(response.data.code !== 200) {
      ElMessage.error(response.data.message)
      return
    }
    ElMessage.success(`验证码已发送至 ${registerForm.email}`)

    // Set countdown for resend button
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

  } catch (error) {
    console.error('Email validation failed:', error)
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // Check if terms are agreed
    if (!registerForm.agreeTerms) {
      ElMessage.warning('Please agree to the Terms and Privacy Policy')
      return
    }

    await formRef.value.validate()
    loading.value = true

    // In a real app, this would register the user through the API
    // For demo purposes, we'll simulate a successful registration
    const response = await authApi.register(registerForm)

    if(response.data.code === 200)
    {
      ElMessage.success(response.data.message)
      router.push('/')
    }
    else
    {
      ElMessage.error(response.data.message)
      loading.value = false
    }
  } catch (error) {
    ElMessage.error(error.message)
    loading.value = false
  }
}

// Handle OAuth login
const handleOAuth = (provider) => {
  // In a real implementation, this would redirect to the OAuth provider
  // For demo purposes, we'll just show a message
  ElMessage.info(`${provider} registration would redirect to authentication page`)
}

// Watch email field to show verification code field
watch(() => registerForm.email, (newValue) => {
  if (newValue && newValue.includes('@')) {
    showVerification.value = true
  }
})
</script>

<style scoped>
.auth-page {
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* Adjust gap as needed */
  margin-top: 1.5rem;
  /* Adjust margin as needed */
}

.oauth-button {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #dcdfe6;
  /* Light border color */
  border-radius: 4px;
  /* Rounded corners */
  background-color: #ffffff;
  /* White background */
  color: #303133;
  /* Dark text color */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Center content */
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
}

.oauth-button:hover {
  border-color: #409eff;
  /* Highlight border on hover */
  color: #409eff;
  /* Highlight text on hover */
}

.oauth-button .el-icon {
  margin-right: 0.5rem;
  /* Space between icon and text */
}

/* Specific styles for Google and Github buttons if needed */
.google-button {
  /* Add specific Google styling if different */
}

.github-button {
  /* Add specific Github styling if different */
}

.form-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  /* Adjust margin as needed */
  color: #606266;
  /* Divider text color */
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background: #dcdfe6;
  /* Divider line color */
}

.form-divider-text {
  padding: 0 1rem;
}

.verification-group {
  display: flex;
  gap: 0.5rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  /* Adjust padding to match OAuth buttons */
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
.form-container {
  width: 100%;
  max-width: 400px; /* Adjust max-width as needed */
  padding: 2rem;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}
</style>