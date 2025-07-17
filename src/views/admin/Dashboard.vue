<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1>管理员仪表盘</h1>
      
      <div class="stats-grid">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <h3>文章总数</h3>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.posts }}</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <h3>评论总数</h3>
              <el-icon><ChatDotRound /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.comments }}</div>
        </el-card>
        
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <h3>用户总数</h3>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ stats.users }}</div>
        </el-card>
      </div>
      
      <div class="admin-actions">
        <router-link to="/admin/blog/create">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新文章
          </el-button>
        </router-link>
      </div>
      
      <!-- 公共资源上传区域 -->
      <el-card class="upload-section">
        <template #header>
          <div class="card-header">
            <h3>公共资源管理</h3>
            <el-icon><FolderOpened /></el-icon>
          </div>
        </template>
        
        <div class="upload-area">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            multiple 
            style="display: none"
          >
          <el-button 
            type="success" 
            size="large"
            @click="$refs.fileInput.click()" 
            :disabled="isUploading"
            :loading="isUploading"
          >
            <el-icon><Upload /></el-icon>
            <span v-if="!isUploading">上传公共资源</span>
            <span v-else>上传中... {{ uploadProgress }}%</span>
          </el-button>
          
          <div class="upload-tips">
            <p>支持多文件上传，文件将作为公共资源供所有用户访问</p>
            <p>支持的文件类型：文档、图片、视频、音频等</p>
          </div>
          
          <!-- 上传进度条 -->
          <el-progress 
            v-if="isUploading" 
            :percentage="uploadProgress" 
            :stroke-width="8"
            class="upload-progress"
          />
        </div>
      </el-card>
      
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, FolderOpened } from '@element-plus/icons-vue'
import { resourceApi } from '@/api/resource'
import { useUserStore } from '@/stores/user'

// 用户状态
const userStore = useUserStore()

// 响应式数据
const stats = ref({
  posts: 0,
  comments: 0,
  users: 0
})

const isUploading = ref(false)
const uploadProgress = ref(0)

// 根据文件扩展名获取ContentType
const getContentType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const contentTypeMap = {
    // 文档类型
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // 图片类型
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    
    // 视频类型
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    
    // 音频类型
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    
    // 压缩文件
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // 其他常见类型
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'csv': 'text/csv'
  }
  
  return contentTypeMap[extension] || 'application/octet-stream'
}

// 文件上传处理
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  // 检查用户是否为管理员
  if (!userStore.isLoggedIn ||  !userStore.isAdmin) 
  {
    ElMessage.warning('只有管理员可以上传公共资源')
    return
  }
  
  ElMessage.info(`开始上传 ${files.length} 个公共资源文件...`)
  
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        await uploadPublicFileToOSS(file)
        uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
      } catch (error) {
        console.error('上传文件失败:', file.name, error)
        ElMessage.error(`上传文件 "${file.name}" 失败，请稍后再试`)
      }
    }
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    // 清空文件输入框
    event.target.value = ''
    
    if (files.length > 1) {
      ElMessage.success('所有公共资源文件上传完成！')
    }
  }
}

// OSS公共文件上传方法
const uploadPublicFileToOSS = async (file) => {
  try {
    // 第一步：获取OSS签名，type设置为1表示公共资源
    const requestData = {
      type: 1, // 公共资源类型
      objectName: file.name,
      bucketName: "resource-5",
      userId: userStore.user?.id || null,
      size: file.size,
      contentType: getContentType(file.name)
    }

    const signatureResponse = await resourceApi.getOssSignature(requestData)
    
    if (!signatureResponse.data || signatureResponse.data.code !== 200) {
      throw new Error("获取OSS签名失败")
    }

    const signatureData = signatureResponse.data
    const ossData = signatureData.data
    console.log('OSS上传数据:', ossData)

    const response = await fetch(ossData, {
      method: 'PUT',
      headers: {'Content-Type': getContentType(file.name)},
      body: file
    })

    console.log('上传响应状态:', response.ok)

    if (!response.ok) {
       throw new Error(`Upload failed, status: ${response.status}`)
    }
      
    ElMessage.success(`公共资源文件 "${file.name}" 上传成功！`)
      
  } catch(err) {
    console.error('上传公共资源失败:', err)
    ElMessage.error(`上传公共资源文件 "${file.name}" 失败，请稍后再试`)
    throw err
  }
}

onMounted(() => {
  // Fetch dashboard stats
  // This would be replaced with actual API calls
  stats.value = {
    posts: 25,
    comments: 148,
    users: 53
  }
})
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1e293b;
}

:deep(.dark-mode) h1 {
  color: #f1f5f9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
}

:deep(.dark-mode) .stat-card {
  background-color: #1e1e1e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #64748b;
}

:deep(.dark-mode) .card-header h3 {
  color: #94a3b8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: #0288d1;
  text-align: center;
  padding: 1rem 0;
}

.admin-actions {
  margin-bottom: 2rem;
}

.upload-section {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
}

:deep(.dark-mode) .upload-section {
  background-color: #1e1e1e;
}

.upload-area {
  text-align: center;
  padding: 2rem;
}

.upload-tips {
  margin-top: 1rem;
  color: #64748b;
}

:deep(.dark-mode) .upload-tips {
  color: #94a3b8;
}

.upload-tips p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.upload-progress {
  margin-top: 1rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-area {
    padding: 1rem;
  }
}
</style>
```