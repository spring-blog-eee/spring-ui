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
          <div class="header-name">文件</div>
          <div class="header-size">大小</div>
          <div class="header-date">上传日期</div>
          <div class="header-uploader">上传者</div>
          <div class="header-actions">操作</div>
        </div>
        <div 
          v-for="file in filteredPublicFiles" 
          :key="file.id" 
          class="file-item"
        >
          <div class="item-icon">📄</div>
          <div class="item-name">{{ file.name }}</div>
          <div class="item-size">{{ file.size }}</div>
          <div class="item-date">{{ file.uploadDate }}</div>
          <div class="item-uploader">{{ file.uploader }}</div>
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
          <button class="upload-btn" @click="$refs.fileInput.click()">📤 上传文件</button>
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
import { ref, computed } from 'vue'

// 响应式数据
const activeTab = ref('public')
const publicSearchQuery = ref('')
const privateSearchQuery = ref('')
const publicFilter = ref('all')
const privateFilter = ref('all')
const usedStorage = ref(2.5)
const totalStorage = ref(10)

// 模拟公共资料数据
const publicFiles = ref([
  {
    id: 1,
    name: 'Vue.js 开发指南.pdf',
    size: '2.5MB',
    type: 'document',
    uploadDate: '2024-01-15',
    uploader: '管理员'
  },
  {
    id: 2,
    name: '项目架构图.png',
    size: '1.2MB',
    type: 'image',
    uploadDate: '2024-01-14',
    uploader: '张三'
  },
  {
    id: 3,
    name: 'API 文档.docx',
    size: '800KB',
    type: 'document',
    uploadDate: '2024-01-13',
    uploader: '李四'
  }
])

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
    const matchesSearch = file.name.toLowerCase().includes(publicSearchQuery.value.toLowerCase())
    const matchesFilter = publicFilter.value === 'all' || file.type === publicFilter.value
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

// 方法
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    // 这里应该实现实际的文件上传逻辑
    console.log('上传文件:', file.name)
    // 模拟添加到私有文件列表
    privateFiles.value.push({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      type: getFileType(file.name),
      uploadDate: new Date().toISOString().split('T')[0]
    })
  })
}

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image'
  if (['mp4', 'avi', 'mov'].includes(extension)) return 'video'
  return 'other'
}

const downloadFile = (file) => {
  console.log('下载文件:', file.name)
  // 这里应该实现实际的文件下载逻辑
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
  grid-template-columns: 40px 1fr 100px 120px 120px 160px;
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
  grid-template-columns: 40px 1fr 100px 120px 120px 160px;
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
  
  .file-list-header .header-uploader,
  .file-item .item-uploader {
    display: none;
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