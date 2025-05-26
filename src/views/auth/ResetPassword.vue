<template>
  <div class="auth-page">
    <div class="form-container">
      <h1 class="form-title">重置密码</h1>
      
      <template v-if="currentStep === 'request'">
        <p class="form-description">
          输入您的邮箱地址，我们将向您发送验证码以重置密码。
        </p>
        
        <el-form
          ref="requestFormRef"
          :model="requestForm"
          :rules="requestRules"
          @submit.native.prevent="handleRequestSubmit"
        >
          <el-form-item prop="email">
            <el-input
              v-model="requestForm.email"
              placeholder="邮箱"
              type="email"
              prefix-icon="Message"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-button"
            >
              发送重置码
            </el-button>
          </el-form-item>
        </el-form>
      </template>
      
      <template v-else-if="currentStep === 'verify'">
        <p class="form-description">
          输入发送到 <strong>{{ requestForm.email }}</strong> 的验证码
        </p>
        
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          @submit.native.prevent="handleVerifySubmit"
        >
          <el-form-item prop="code">
            <div class="verification-group">
              <el-input
                v-model="verifyForm.code"
                placeholder="验证码"
                prefix-icon="Check"
              />
              <el-button 
                type="primary" 
                :disabled="countdown > 0"
                @click="resendCode"
              >
                {{ countdown > 0 ? `重新发送 ${countdown}s` : '重新发送' }}
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-button"
            >
              验证码
            </el-button>
          </el-form-item>
          
          <div class="form-actions">
            <button type="button" class="text-button" @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </button>
          </div>
        </el-form>
      </template>
      
      <template v-else-if="currentStep === 'reset'">
        <p class="form-description">
          为您的账户创建新密码。
        </p>
        
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          @submit.native.prevent="handleResetSubmit"
        >
          <el-form-item prop="password">
            <el-input
              v-model="resetForm.password"
              placeholder="新密码"
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
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              placeholder="确认新密码"
              :type="showPassword ? 'text' : 'password'"
              prefix-icon="Lock"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-button"
            >
              重置密码
            </el-button>
          </el-form-item>
        </el-form>
      </template>
      
      <template v-else-if="currentStep === 'success'">
        <div class="success-container">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <h2>密码重置成功</h2>
          <p>您的密码已成功重置。您现在可以使用新密码登录了。</p>
          <el-button type="primary" @click="goToLogin" class="submit-button">
            去登录
          </el-button>
        </div>
      </template>
      
      <div class="auth-footer" v-if="currentStep !== 'success'">
        记住密码？
        <router-link to="/login" class="auth-link">
          登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const requestFormRef = ref(null)
const verifyFormRef = ref(null)
const resetFormRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const countdown = ref(0)
const currentStep = ref('request') // request, verify, reset, success

// Request form data and rules
const requestForm = reactive({
  email: ''
})

const requestRules = {
  email: [
    { required: true, message: '请输入您的邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// Verify form data and rules
const verifyForm = reactive({
  code: ''
})

const verifyRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须是6位数字', trigger: 'blur' }
  ]
}

// Reset form data and rules
const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入您的新密码'))
  } else {
    if (resetForm.confirmPassword !== '') {
      resetFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认您的密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不匹配'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码至少需要 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' }
  ]
}

// Go back to previous step
const goBack = () => {
  if (currentStep.value === 'verify') {
    currentStep.value = 'request'
  } else if (currentStep.value === 'reset') {
    currentStep.value = 'verify'
  }
}

// Resend verification code
const resendCode = async () => {
  try {
    // In a real app, this would resend the verification code
    ElMessage.success(`验证码已重新发送至 ${requestForm.email}`)
    
    // Set countdown for resend button
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    // For demo purposes, auto-fill the verification code
    setTimeout(() => {
      verifyForm.code = '123456'
    }, 2000)
  } catch (error) {
    ElMessage.error('重新发送验证码失败')
  }
}

// Handle request password reset
const handleRequestSubmit = async () => {
  if (!requestFormRef.value) return
  
  try {
    await requestFormRef.value.validate()
    loading.value = true
    
    // In a real app, this would send the verification code to the email
    setTimeout(() => {
      ElMessage.success(`验证码已发送至 ${requestForm.email}`)
      currentStep.value = 'verify'
      
      // For demo purposes, auto-fill the verification code
      setTimeout(() => {
        verifyForm.code = '123456'
      }, 2000)
      
      loading.value = false
    }, 1500)
  } catch (error) {
    console.error('Validation failed:', error)
    loading.value = false
  }
}

// Handle verify code
const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return
  
  try {
    await verifyFormRef.value.validate()
    loading.value = true
    
    // In a real app, this would verify the code
    setTimeout(() => {
      ElMessage.success('验证成功')
      currentStep.value = 'reset'
      loading.value = false
    }, 1500)
  } catch (error) {
    console.error('验证失败:', error)
    loading.value = false
  }
}

// Handle reset password
const handleResetSubmit = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    // In a real app, this would reset the password
    setTimeout(() => {
      ElMessage.success('密码重置成功')
      currentStep.value = 'success'
      loading.value = false
    }, 1500)
  } catch (error) {
    console.error('Validation failed:', error)
    loading.value = false
  }
}

// Go to login page
const goToLogin = () => {
  router.push('/login')
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

.form-description {
  margin-bottom: 1.5rem;
  color: #64748b;
  text-align: center;
}

:deep(.dark-mode) .form-description {
  color: #94a3b8;
}

.verification-group {
  display: flex;
  gap: 0.5rem;
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

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
}

.text-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

:deep(.dark-mode) .text-button {
  color: #94a3b8;
}

.text-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #334155;
}

:deep(.dark-mode) .text-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.password-toggle {
  cursor: pointer;
}

.success-container {
  text-align: center;
  padding: 1rem;
}

.success-icon {
  font-size: 4rem;
  color: var(--el-color-success);
  margin-bottom: 1rem;
}

.success-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

:deep(.dark-mode) .success-container h2 {
  color: #f1f5f9;
}

.success-container p {
  color: #64748b;
  margin-bottom: 2rem;
}

:deep(.dark-mode) .success-container p {
  color: #94a3b8;
}
</style>