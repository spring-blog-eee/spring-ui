```vue
<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <h1>我的个人资料</h1>
      </div>
      
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="个人信息" name="profile">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
          >
            <div class="avatar-upload">
              <el-avatar
                :size="100"
                :src="profileForm.avatar || userStore.user?.avatar"
              >
                {{ avatarFallback }}
              </el-avatar>
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
              >
                <el-button type="primary" plain>
                  更改头像
                </el-button>
              </el-upload>
            </div>
            
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" />
            </el-form-item>
            
            <el-form-item label="电子邮件" prop="email">
              <el-input v-model="profileForm.email" disabled />
            </el-form-item>
            
            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下你自己..."
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="saving"
                @click="handleProfileSubmit"
              >
                保存更改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="changingPassword"
                @click="handlePasswordSubmit"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="活动" name="activity">
          <div class="activity-section">
            <h3>最近评论</h3>
            <div v-if="loading" class="loading-container">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="recentComments.length" class="comments-list">
              <div
                v-for="comment in recentComments"
                :key="comment.id"
                class="activity-item"
              >
                <div class="activity-content">
                  <p>{{ comment.content }}</p>
                  <router-link :to="`/blog/${comment.blogId}`" class="activity-link">
                    在：{{ comment.blogTitle }}
                  </router-link>
                </div>
                <span class="activity-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无最近评论</p>
            </div>
          </div>
          
          <div class="activity-section">
            <h3>喜欢的文章</h3>
            <div v-if="loading" class="loading-container">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="likedPosts.length" class="liked-posts">
              <div
                v-for="post in likedPosts"
                :key="post.id"
                class="activity-item"
              >
                <router-link :to="`/blog/${post.id}`" class="activity-content">
                  {{ post.title }}
                </router-link>
                <span class="activity-date">{{ formatDate(post.likedAt) }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无喜欢的文章</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const activeTab = ref('profile')
const profileFormRef = ref(null)
const passwordFormRef = ref(null)
const saving = ref(false)
const changingPassword = ref(false)
const loading = ref(false)

// Avatar fallback
const avatarFallback = computed(() => {
  return userStore.user?.name ? userStore.user.name.charAt(0).toUpperCase() : '用户'
})

// Profile form
const profileForm = reactive({
  name: userStore.user?.name || '',
  email: userStore.user?.email || '',
  bio: userStore.user?.bio || '',
  avatar: ''
})

const profileRules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, message: '姓名至少需要2个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }
  ]
}

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入您的密码'))
  } else {
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认您的密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不匹配'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入您的当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码至少需要6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' }
  ]
}

// Activity data
const recentComments = ref([])
const likedPosts = ref([])

// Methods
const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY')
}

const handleAvatarSuccess = (response) => {
  profileForm.avatar = response.url
  ElMessage.success('头像上传成功')
}

const handleAvatarError = () => {
  ElMessage.error('头像上传失败')
}

const handleProfileSubmit = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    await userStore.updateProfile(profileForm)
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    saving.value = false
  }
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    await userStore.changePassword(passwordForm)
    ElMessage.success('密码修改成功')
    
    // Reset form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    changingPassword.value = false
  }
}

const fetchActivity = async () => {
  loading.value = true
  try {
    // In a real app, these would be API calls
    recentComments.value = [
      {
        id: 1,
        content: 'Great article! Thanks for sharing.',
        blogId: 1,
        blogTitle: 'Getting Started with Vue 3',
        createdAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        content: 'This was very helpful.',
        blogId: 2,
        blogTitle: 'Understanding TypeScript',
        createdAt: '2025-01-10T15:30:00Z'
      }
    ]
    
    likedPosts.value = [
      {
        id: 1,
        title: 'Getting Started with Vue 3',
        likedAt: '2025-01-16T08:00:00Z'
      },
      {
        id: 2,
        title: 'Understanding TypeScript',
        likedAt: '2025-01-12T14:20:00Z'
      }
    ]
  } catch (error) {
    console.error('获取活动失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivity()
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
}

:deep(.dark-mode) h1 {
  color: #f1f5f9;
}

.profile-tabs {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.dark-mode) .profile-tabs {
  background-color: #1e1e1e;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.activity-section {
  margin-bottom: 2rem;
}

.activity-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

:deep(.dark-mode) .activity-section h3 {
  color: #f1f5f9;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.dark-mode) .activity-item {
  border-bottom-color: #2d3748;
}

.activity-content {
  flex: 1;
  margin-right: 1rem;
}

.activity-content p {
  margin: 0 0 0.5rem;
  color: #334155;
}

:deep(.dark-mode) .activity-content p {
  color: #e2e8f0;
}

.activity-link {
  font-size: 0.875rem;
  color: var(--el-color-primary);
  text-decoration: none;
}

.activity-link:hover {
  text-decoration: underline;
}

.activity-date {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

:deep(.dark-mode) .activity-date {
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

:deep(.dark-mode) .empty-state {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .profile-tabs {
    padding: 1rem;
  }
  
  .activity-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .activity-date {
    font-size: 0.75rem;
  }
}
</style>
```