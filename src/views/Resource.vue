<template>
  <div class="resource-container">
    <!-- 功能选择标签 -->
    <div class="tab-container">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'public' }"
        @click="activeTab = 'public'"
      >
        公共资料
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'private' }"
        @click="activeTab = 'private'"
      >
        私有网盘
      </button>
    </div>

    <!-- 公共资料模块 -->
    <div v-if="activeTab === 'public'" class="content-section">
      
      <div class="toolbar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="publicSearchQuery" 
            placeholder="搜索公共资料..."
            class="search-input"
          >
          <button class="search-btn">🔍</button>
        </div>
        <div class="filter-options">
          <select v-model="publicFilter" class="filter-select">
            <option value="all">所有类型</option>
            <option value="document">文档</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      <div class="file-list">
        <div class="file-list-header">
          <div class="header-name"></div>
          <div class="header-name">文件</div>
          <div class="header-size">大小</div>
          <div class="header-date">上传日期</div>
          <div class="header-actions">操作</div>
        </div>
        <div 
          v-for="file in filteredPublicFiles" 
          :key="file.id" 
          class="file-item"
        >
          <div class="item-icon">📄</div>
          <div class="item-name">{{ file.objectName }}</div>
          <div class="item-size">{{ formatFileSize(file.size) }}</div>
          <div class="item-date">{{ formatDate(file.createTime) }}</div>
          <div class="item-actions">
            <button class="action-btn download-btn" @click="downloadFile(file)">下载</button>
            <button class="action-btn view-btn" @click="viewFile(file)">预览</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 私有网盘模块 -->
    <div v-if="activeTab === 'private'" class="content-section">
      
      <div class="toolbar">
        <div class="upload-section">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            multiple 
            style="display: none"
          >
          <button class="upload-btn" @click="$refs.fileInput.click()" :disabled="isUploading">
            <span v-if="!isUploading">📤 上传文件</span>
            <span v-else>⏳ 上传中... {{ uploadProgress }}%</span>
          </button>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="privateSearchQuery" 
            placeholder="搜索我的文件..."
            class="search-input"
          >
          <button class="search-btn">🔍</button>
        </div>
        <div class="filter-options">
          <select v-model="privateFilter" class="filter-select">
            <option value="all">所有类型</option>
            <option value="document">文档</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      <div class="storage-info">
        <div class="storage-bar">
          <div class="storage-used" :style="{ width: storagePercentage + '%' }"></div>
        </div>
        <p class="storage-text">已使用 {{ usedStorage }}GB / {{ totalStorage }}GB</p>
      </div>

      <div class="file-list">
          <div class="file-list-header private">
            <div class="header-name"></div>
            <div class="header-name">文件</div>
            <div class="header-size">大小</div>
            <div class="header-date">上传日期</div>
            <div class="header-actions">操作</div>
          </div>
          <div 
            v-for="file in filteredPrivateFiles" 
            :key="file.id" 
            class="file-item private"
          >
            <div class="item-icon">📄</div>
            <div class="item-name">{{ file.name }}</div>
            <div class="item-size">{{ file.size }}</div>
            <div class="item-date">{{ file.uploadDate }}</div>
            <div class="item-actions">
              <button class="action-btn download-btn" @click="downloadFile(file)">下载</button>
              <button class="action-btn view-btn" @click="viewFile(file)">预览</button>
              <button class="action-btn delete-btn" @click="deleteFile(file)">删除</button>
              <button class="action-btn share-btn" @click="shareFile(file)">分享</button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { resourceApi } from '@/api/resource'

// 响应式数据
const activeTab = ref('public')
const publicSearchQuery = ref('')
const privateSearchQuery = ref('')
const publicFilter = ref('all')
const privateFilter = ref('all')
const usedStorage = ref(2.5)
const totalStorage = ref(10)
const isUploading = ref(false)
const uploadProgress = ref(0)

// 公共资料数据
const publicFiles = ref([])

// 模拟私有文件数据
const privateFiles = ref([
  {
    id: 1,
    name: '个人简历.pdf',
    size: '500KB',
    type: 'document',
    uploadDate: '2024-01-12'
  },
  {
    id: 2,
    name: '项目截图.jpg',
    size: '2.1MB',
    type: 'image',
    uploadDate: '2024-01-11'
  }
])

// 计算属性
const storagePercentage = computed(() => {
  return (usedStorage.value / totalStorage.value) * 100
})

const filteredPublicFiles = computed(() => {
  return publicFiles.value.filter(file => {
    const matchesSearch = file.objectName.toLowerCase().includes(publicSearchQuery.value.toLowerCase())
    const matchesFilter = publicFilter.value === 'all' || getFileType(file.objectName) === publicFilter.value
    return matchesSearch && matchesFilter
  })
})

const filteredPrivateFiles = computed(() => {
  return privateFiles.value.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(privateSearchQuery.value.toLowerCase())
    const matchesFilter = privateFilter.value === 'all' || file.type === privateFilter.value
    return matchesSearch && matchesFilter
  })
})

// 获取公共资源数据
const fetchPublicResources = async () => {
  try {
    const response = await resourceApi.getPublicResources()
    if (response.data && response.data.code === 200) {
      publicFiles.value = response.data.data
    }
  } catch (error) {
    console.error('获取公共资源失败:', error)
    alert('获取公共资源失败，请稍后再试')
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPublicResources()
})

// 方法
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        await uploadFileToOSS(file)
        uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
      } catch (error) {
        console.error('上传文件失败:', file.name, error)
        alert(`上传文件 "${file.name}" 失败，请稍后再试`)
      }
    }
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    // 清空文件输入框
    event.target.value = ''
  }
}

// OSS文件上传方法
const uploadFileToOSS = async (file) => {
  try {
    // 第一步：获取OSS签名
    const requestData = {
      type: 0,
      objectName: file.name,
      bucketName: "resource-5",
      userId: 8, // 这里应该从用户状态中获取
      size: file.size,
      contentType: getContentType(file.name)
    }

    const signatureResponse = await fetch("/resource/oss/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })

    if (!signatureResponse.ok) {
      throw new Error("获取OSS签名失败")
    }

    const signatureData = await signatureResponse.json()
    const ossData = signatureData.data

    console.log(ossData)

    const response = await fetch(ossData, 
    {
      method: 'PUT',
      headers: {'Content-Type':getContentType(file.name)},
      body: file
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok)
    {
       throw new Error(`Upload failed, status: ${response.status}`);

    }

    alert('File uploaded successfully');
    console.log('File uploaded successfully')
      
      // 上传成功后添加到私有文件列表
      privateFiles.value.push({
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        type: getFileType(file.name),
        uploadDate: new Date().toISOString().split('T')[0]
      })
      
      // 更新存储使用量
      usedStorage.value += file.size / (1024 * 1024 * 1024)
      
      alert(`文件 "${file.name}" 上传成功！`)
      
      // // 解析回调信息（如果需要）
      // const callbackData = await uploadResponse.json()
      // console.log("上传回调信息:", callbackData)
      
    } catch(err) {
      // throw new Error(`上传失败，状态码: ${uploadResponse.status}`)
    }
}

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image'
  if (['mp4', 'avi', 'mov'].includes(extension)) return 'video'
  return 'other'
}

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

const downloadFile = async (file) => {
  try {
    // 调用API获取下载URL
    const response = await resourceApi.getDownloadUrl(file)
    
    if (response.data && response.data.code === 200) {
      const downloadUrl = response.data.data
      
      // 创建临时链接并触发下载
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.objectName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('文件下载开始:', file.objectName)
    } else {
      throw new Error('获取下载链接失败')
    }
  } catch (error) {
    console.error('下载文件失败:', error)
    alert(`下载文件 "${file.objectName}" 失败，请稍后再试`)
  }
}

const viewFile = (file) => {
  console.log('预览文件:', file.name)
  // 这里应该实现文件预览逻辑
}

const deleteFile = (file) => {
  if (confirm(`确定要删除文件 "${file.name}" 吗？`)) {
    const index = privateFiles.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      privateFiles.value.splice(index, 1)
    }
  }
}

const shareFile = (file) => {
  console.log('分享文件:', file.name)
  // 这里应该实现文件分享逻辑
  alert(`文件 "${file.name}" 的分享链接已生成！`)
}
</script>

<style scoped>
.resource-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.resource-header {
  text-align: center;
  margin-bottom: 30px;
}

.resource-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.resource-header p {
  color: #666;
  font-size: 1.1rem;
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 1.1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: #f8f9fa;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 600;
}

.content-section {
  margin-top: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 5px;
}

.section-header p {
  color: #666;
}

.toolbar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.search-input {
  padding: 10px 15px;
  border: none;
  outline: none;
  min-width: 200px;
}

.search-btn {
  padding: 10px 15px;
  border: none;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #e9ecef;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.upload-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #218838;
}

.upload-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-btn:disabled:hover {
  background-color: #6c757d;
}

.storage-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-used {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.storage-text {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.file-list {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  overflow: hidden;
}

.file-list-header {
  display: grid;
  grid-template-columns: 40px 1fr 100px 120px 160px;
  gap: 15px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.file-list-header.private {
  grid-template-columns: 40px 1fr 100px 120px 250px;
}

.file-item.private {
  grid-template-columns: 40px 1fr 100px 120px 250px;
}

.file-item {
  display: grid;
  grid-template-columns: 40px 1fr 100px 120px 160px;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 1.2rem;
  text-align: center;
}

.item-name {
  font-weight: 500;
  color: #333;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-size {
  color: #666;
  font-size: 0.9rem;
}

.item-date {
  color: #666;
  font-size: 0.9rem;
}

.item-uploader {
  color: #666;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.download-btn {
  background-color: #007bff;
  color: white;
}

.download-btn:hover {
  background-color: #0056b3;
}

.view-btn {
  background-color: #6c757d;
  color: white;
}

.view-btn:hover {
  background-color: #545b62;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.share-btn {
  background-color: #28a745;
  color: white;
}

.share-btn:hover {
  background-color: #218838;
}

@media (max-width: 768px) {
  .resource-container {
    padding: 15px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .file-list-header {
    grid-template-columns: 30px 1fr 80px 140px;
    gap: 10px;
    padding: 10px 15px;
    font-size: 0.8rem;
  }
  
  .file-list-header.private {
    grid-template-columns: 30px 1fr 80px 180px;
  }
  
  .file-item {
    grid-template-columns: 30px 1fr 80px 140px;
    gap: 10px;
    padding: 10px 15px;
  }
  
  .file-item.private {
    grid-template-columns: 30px 1fr 80px 180px;
  }
  
  .item-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .action-btn {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

/* 黑夜模式样式 */
.dark-mode {
  .resource-container {
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
  }
  
  .tab-container {
    border-bottom-color: var(--el-border-color);
  }
  
  .tab-button {
    color: var(--el-text-color-regular);
    background-color: transparent;
  }
  
  .tab-button:hover {
    background-color: var(--el-fill-color-light);
  }
  
  .tab-button.active {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary);
  }
  
  .search-box {
    border-color: var(--el-border-color);
  }
  
  .search-input {
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
    border-color: var(--el-border-color);
  }
  
  .search-input::placeholder {
    color: var(--el-text-color-placeholder);
  }
  
  .search-btn {
    background-color: var(--el-fill-color);
    color: var(--el-text-color-regular);
  }
  
  .search-btn:hover {
    background-color: var(--el-fill-color-dark);
  }
  
  .filter-select {
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
    border-color: var(--el-border-color);
  }
  
  .upload-btn {
    background-color: var(--el-color-success);
  }
  
  .upload-btn:hover {
    background-color: var(--el-color-success-dark);
  }
  
  .storage-info {
    background-color: var(--el-fill-color);
  }
  
  .storage-bar {
    background-color: var(--el-fill-color-dark);
  }
  
  .storage-used {
    background-color: var(--el-color-primary);
  }
  
  .storage-text {
    color: var(--el-text-color-secondary);
  }
  
  .file-list {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .file-list-header {
    background-color: var(--el-fill-color-light);
    border-bottom-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
  
  .file-item {
    border-bottom-color: var(--el-border-color-lighter);
  }
  
  .file-item:hover {
    background-color: var(--el-fill-color-light);
  }
  
  .item-name {
    color: var(--el-text-color-primary);
  }
  
  .item-size,
  .item-date,
  .item-uploader {
    color: var(--el-text-color-secondary);
  }
  
  .download-btn {
    background-color: var(--el-color-primary);
  }
  
  .download-btn:hover {
    background-color: var(--el-color-primary-dark);
  }
  
  .view-btn {
    background-color: var(--el-fill-color-darker);
  }
  
  .view-btn:hover {
    background-color: var(--el-border-color-darker);
  }
  
  .delete-btn {
    background-color: var(--el-color-danger);
  }
  
  .delete-btn:hover {
    background-color: var(--el-color-danger-dark);
  }
  
  .share-btn {
    background-color: var(--el-color-success);
  }
  
  .share-btn:hover {
    background-color: var(--el-color-success-dark);
  }
}
</style>