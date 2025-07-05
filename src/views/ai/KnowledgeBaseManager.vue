<template>
  <div class="knowledge-base-manager-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>知识库管理</h1>
      <p>管理您的个人知识库，支持文件上传、网址链接和资料库导入</p>
      <button class="create-kb-btn" @click="showCreateDialog = true">
           <el-icon><Plus /></el-icon>
           新建知识库
         </button>
    </div>

    <!-- 知识库列表 -->
    <div class="kb-list-container">
      <div class="kb-list-header">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="搜索知识库..." 
            v-model="searchQuery"
            class="search-input"
          />
          <button class="search-btn">
             <el-icon><Search /></el-icon>
           </button>
        </div>
        <div class="filter-options">
          <select v-model="filterType" class="filter-select">
            <option value="all">全部类型</option>
            <option value="file">文件类型</option>
            <option value="url">网址类型</option>
            <option value="resource">资料库类型</option>
          </select>
        </div>
      </div>

      <div class="kb-grid">
        <div 
          v-for="kb in filteredKnowledgeBases" 
          :key="kb.id"
          class="kb-card"
        >
          <div class="kb-card-header">
            <div class="kb-type-badge" :class="`type-${kb.type}`">
               <el-icon><component :is="getTypeIcon(kb.type)" /></el-icon>
               {{ getTypeName(kb.type) }}
             </div>
            <div class="kb-actions">
              <button class="action-btn edit-btn" @click="editKnowledgeBase(kb)">
                 <el-icon><Edit /></el-icon>
               </button>
               <button class="action-btn delete-btn" @click="deleteKnowledgeBase(kb.id)">
                 <el-icon><Delete /></el-icon>
               </button>
            </div>
          </div>
          <div class="kb-card-body">
            <h3 class="kb-name">{{ kb.name }}</h3>
            <p class="kb-description">{{ kb.description || '暂无描述' }}</p>
            <div class="kb-meta">
              <span class="kb-size">{{ kb.size }} 条目</span>
              <span class="kb-updated">{{ formatDate(kb.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
       <div v-if="filteredKnowledgeBases.length === 0" class="empty-state">
         <el-icon class="empty-icon"><FolderOpened /></el-icon>
         <h3>暂无知识库</h3>
         <p>点击上方按钮创建您的第一个知识库</p>
       </div>
    </div>

    <!-- 创建/编辑知识库对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ isEditing ? '编辑知识库' : '新建知识库' }}</h2>
          <button class="close-btn" @click="closeDialog">
             <el-icon><Close /></el-icon>
           </button>
        </div>
        
        <div class="dialog-body">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3>基本信息</h3>
            <div class="form-group">
              <label for="kb-name">知识库名称</label>
              <input 
                id="kb-name"
                type="text" 
                v-model="currentKB.name" 
                placeholder="请输入知识库名称"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="kb-description">描述</label>
              <textarea 
                id="kb-description"
                v-model="currentKB.description" 
                placeholder="请输入知识库描述（可选）"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- 数据源选择 -->
          <div class="form-section">
            <h3>数据源</h3>
            <div class="source-tabs">
              <button 
                   v-for="source in dataSources" 
                   :key="source.type"
                   class="source-tab"
                   :class="{ active: currentKB.sourceType === source.type }"
                   @click="currentKB.sourceType = source.type"
                 >
                   <el-icon><component :is="source.icon" /></el-icon>
                   {{ source.name }}
                 </button>
            </div>

            <!-- 文件上传 -->
            <div v-if="currentKB.sourceType === 'file'" class="source-content">
              <div class="upload-area" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
                <input 
                  type="file" 
                  ref="fileInput"
                  multiple
                  accept=".txt,.pdf,.doc,.docx,.md"
                  @change="handleFileSelect"
                  style="display: none;"
                />
                <div class="upload-placeholder">
                   <el-icon class="upload-icon"><Upload /></el-icon>
                   <p>拖拽文件到此处或 <button @click="$refs.fileInput.click()" class="upload-link">点击选择文件</button></p>
                   <p class="upload-hint">支持 TXT、PDF、DOC、DOCX、MD 格式</p>
                 </div>
                <div v-if="currentKB.files.length > 0" class="file-list">
                  <div v-for="(file, index) in currentKB.files" :key="index" class="file-item">
                     <el-icon><Document /></el-icon>
                     <span class="file-name">{{ file.name }}</span>
                     <span class="file-size">{{ formatFileSize(file.size) }}</span>
                     <button class="remove-file-btn" @click="removeFile(index)">
                       <el-icon><Close /></el-icon>
                     </button>
                   </div>
                </div>
              </div>
            </div>

            <!-- 网址链接 -->
            <div v-if="currentKB.sourceType === 'url'" class="source-content">
              <div class="url-input-section">
                <div class="form-group">
                  <label for="url-input">网址链接</label>
                  <div class="url-input-group">
                    <input 
                      id="url-input"
                      type="url" 
                      v-model="newUrl" 
                      placeholder="请输入网址链接，如：https://example.com"
                      class="form-input"
                      @keyup.enter="addUrl"
                    />
                    <button class="add-url-btn" @click="addUrl">
                       <el-icon><Plus /></el-icon>
                       添加
                     </button>
                  </div>
                </div>
                <div v-if="currentKB.urls.length > 0" class="url-list">
                  <div v-for="(url, index) in currentKB.urls" :key="index" class="url-item">
                     <el-icon><Link /></el-icon>
                     <span class="url-text">{{ url }}</span>
                     <button class="remove-url-btn" @click="removeUrl(index)">
                       <el-icon><Close /></el-icon>
                     </button>
                   </div>
                </div>
              </div>
            </div>

            <!-- 资料库选择 -->
            <div v-if="currentKB.sourceType === 'resource'" class="source-content">
              <div class="resource-selection">
                <div class="form-group">
                  <label>选择资料库类型</label>
                  <div class="resource-type-options">
                    <label class="radio-option">
                      <input type="radio" v-model="currentKB.resourceType" value="public" />
                      <span>公共资料</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" v-model="currentKB.resourceType" value="private" />
                      <span>私有网盘</span>
                    </label>
                  </div>
                </div>
                <div class="resource-list">
                  <div class="resource-search">
                    <input 
                      type="text" 
                      placeholder="搜索资料..."
                      v-model="resourceSearchQuery"
                      class="form-input"
                    />
                  </div>
                  <div class="resource-items">
                    <div 
                      v-for="resource in filteredResources" 
                      :key="resource.id"
                      class="resource-item"
                      :class="{ selected: isResourceSelected(resource.id) }"
                      @click="toggleResourceSelection(resource.id)"
                    >
                      <div class="resource-checkbox">
                        <input 
                          type="checkbox" 
                          :checked="isResourceSelected(resource.id)"
                          @change="toggleResourceSelection(resource.id)"
                        />
                      </div>
                      <div class="resource-info">
                         <el-icon><component :is="getResourceIcon(resource.type)" /></el-icon>
                         <div class="resource-details">
                           <span class="resource-name">{{ resource.name }}</span>
                           <span class="resource-meta">{{ resource.size }} • {{ resource.date }}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="save-btn" @click="saveKnowledgeBase" :disabled="!canSave">
            {{ isEditing ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Search,
  Edit,
  Delete,
  Close,
  FolderOpened,
  Document,
  Link,
  Folder,
  Upload,
  Picture,
  MoreFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const filterType = ref('all')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newUrl = ref('')
const resourceSearchQuery = ref('')

// 知识库数据
const knowledgeBases = ref([
  {
    id: 1,
    name: '技术文档库',
    description: '包含各种技术文档和API参考',
    type: 'file',
    size: 156,
    updatedAt: new Date('2024-01-15'),
    files: [],
    urls: [],
    resources: []
  },
  {
    id: 2,
    name: '官方网站内容',
    description: '从官方网站抓取的内容',
    type: 'url',
    size: 89,
    updatedAt: new Date('2024-01-10'),
    files: [],
    urls: ['https://example.com'],
    resources: []
  }
])

// 当前编辑的知识库
const currentKB = ref({
  id: null,
  name: '',
  description: '',
  sourceType: 'file',
  resourceType: 'public',
  files: [],
  urls: [],
  resources: []
})

// 数据源类型
 const dataSources = [
   { type: 'file', name: '文件上传', icon: Upload },
   { type: 'url', name: '网址链接', icon: Link },
   { type: 'resource', name: '资料库', icon: Folder }
 ]

// 模拟资料库数据
const mockResources = ref([
  { id: 1, name: '个人简历.pdf', type: 'pdf', size: '500KB', date: '2024-01-12' },
  { id: 2, name: '项目截图.jpg', type: 'image', size: '2.1MB', date: '2024-01-11' },
  { id: 3, name: '技术文档.md', type: 'markdown', size: '156KB', date: '2024-01-10' }
])

// 计算属性
const isEditing = computed(() => showEditDialog.value)

const filteredKnowledgeBases = computed(() => {
  let filtered = knowledgeBases.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(kb => 
      kb.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (kb.description && kb.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  
  if (filterType.value !== 'all') {
    filtered = filtered.filter(kb => kb.type === filterType.value)
  }
  
  return filtered
})

const filteredResources = computed(() => {
  if (!resourceSearchQuery.value) return mockResources.value
  
  return mockResources.value.filter(resource => 
    resource.name.toLowerCase().includes(resourceSearchQuery.value.toLowerCase())
  )
})

const canSave = computed(() => {
  if (!currentKB.value.name.trim()) return false
  
  if (currentKB.value.sourceType === 'file' && currentKB.value.files.length === 0) return false
  if (currentKB.value.sourceType === 'url' && currentKB.value.urls.length === 0) return false
  if (currentKB.value.sourceType === 'resource' && currentKB.value.resources.length === 0) return false
  
  return true
})

// 方法
 const getTypeIcon = (type) => {
   const icons = {
     file: Document,
     url: Link,
     resource: Folder
   }
   return icons[type] || Document
 }

const getTypeName = (type) => {
  const names = {
    file: '文件',
    url: '网址',
    resource: '资料库'
  }
  return names[type] || '未知'
}

const getResourceIcon = (type) => {
   const icons = {
     pdf: Document,
     image: Picture,
     markdown: Document,
     doc: Document
   }
   return icons[type] || Document
 }

const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const editKnowledgeBase = (kb) => {
  currentKB.value = { ...kb }
  showEditDialog.value = true
}

const deleteKnowledgeBase = (id) => {
  if (confirm('确定要删除这个知识库吗？')) {
    knowledgeBases.value = knowledgeBases.value.filter(kb => kb.id !== id)
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  resetCurrentKB()
}

const resetCurrentKB = () => {
  currentKB.value = {
    id: null,
    name: '',
    description: '',
    sourceType: 'file',
    resourceType: 'public',
    files: [],
    urls: [],
    resources: []
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  currentKB.value.files.push(...files)
}

const handleFileDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  currentKB.value.files.push(...files)
}

const removeFile = (index) => {
  currentKB.value.files.splice(index, 1)
}

const addUrl = () => {
  if (newUrl.value.trim() && isValidUrl(newUrl.value)) {
    currentKB.value.urls.push(newUrl.value.trim())
    newUrl.value = ''
  }
}

const removeUrl = (index) => {
  currentKB.value.urls.splice(index, 1)
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const isResourceSelected = (resourceId) => {
  return currentKB.value.resources.includes(resourceId)
}

const toggleResourceSelection = (resourceId) => {
  const index = currentKB.value.resources.indexOf(resourceId)
  if (index > -1) {
    currentKB.value.resources.splice(index, 1)
  } else {
    currentKB.value.resources.push(resourceId)
  }
}

const saveKnowledgeBase = () => {
  if (!canSave.value) return
  
  const kbData = {
    ...currentKB.value,
    updatedAt: new Date(),
    size: calculateKBSize()
  }
  
  if (isEditing.value) {
    const index = knowledgeBases.value.findIndex(kb => kb.id === currentKB.value.id)
    if (index > -1) {
      knowledgeBases.value[index] = kbData
    }
  } else {
    kbData.id = Date.now()
    kbData.type = currentKB.value.sourceType
    knowledgeBases.value.push(kbData)
  }
  
  closeDialog()
}

const calculateKBSize = () => {
  // 简单的大小计算逻辑
  let size = 0
  size += currentKB.value.files.length * 10
  size += currentKB.value.urls.length * 5
  size += currentKB.value.resources.length * 8
  return size
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.knowledge-base-manager-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.create-kb-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-kb-btn:hover {
  background-color: #0056b3;
}

.kb-list-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.kb-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
}

.search-btn {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.kb-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.kb-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.kb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.kb-type-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.type-file {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-url {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.type-resource {
  background-color: #e8f5e8;
  color: #388e3c;
}

.kb-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background-color: #fff3cd;
  color: #856404;
}

.edit-btn:hover {
  background-color: #ffeaa7;
}

.delete-btn {
  background-color: #f8d7da;
  color: #721c24;
}

.delete-btn:hover {
  background-color: #f5c6cb;
}

.kb-card-body {
  padding: 15px;
}

.kb-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.kb-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.kb-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #666;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  padding: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.source-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.source-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.source-tab:hover {
  background-color: #f8f9fa;
}

.source-tab.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.source-content {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-placeholder i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 15px;
  display: block;
}

.upload-link {
  color: #007bff;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.upload-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.file-list,
.url-list {
  margin-top: 15px;
}

.file-item,
.url-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-name,
.url-text {
  flex-grow: 1;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.remove-file-btn,
.remove-url-btn {
  padding: 4px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.url-input-group {
  display: flex;
  gap: 10px;
}

.add-url-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.resource-type-options {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.resource-list {
  margin-top: 15px;
}

.resource-search {
  margin-bottom: 15px;
}

.resource-items {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.resource-item:hover {
  background-color: #f8f9fa;
}

.resource-item.selected {
  background-color: #e3f2fd;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1;
}

.resource-details {
  display: flex;
  flex-direction: column;
}

.resource-name {
  font-size: 14px;
  color: #333;
}

.resource-meta {
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ElementPlus 图标样式 */
 .create-kb-btn .el-icon,
 .search-btn .el-icon,
 .action-btn .el-icon,
 .close-btn .el-icon,
 .add-url-btn .el-icon,
 .remove-file-btn .el-icon,
 .remove-url-btn .el-icon {
   font-size: 16px;
 }
 
 .kb-type-badge .el-icon {
   font-size: 14px;
 }
 
 .upload-icon {
   font-size: 48px;
   color: #ccc;
   margin-bottom: 15px;
   display: block;
 }
 
 .empty-icon {
   font-size: 48px;
   margin-bottom: 16px;
   display: block;
 }
 
 .source-tab .el-icon {
   font-size: 16px;
 }
 
 .file-item .el-icon,
 .url-item .el-icon,
 .resource-info .el-icon {
   font-size: 16px;
   flex-shrink: 0;
 }

/* 暗黑模式样式 */
.dark-mode .knowledge-base-manager-container {
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.dark-mode .page-header {
  border-bottom-color: var(--el-border-color);
}

.dark-mode .page-header h1 {
  color: var(--el-text-color-primary);
}

.dark-mode .page-header p {
  color: var(--el-text-color-regular);
}

.dark-mode .create-kb-btn {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}

.dark-mode .create-kb-btn:hover {
  background-color: var(--el-color-primary-light-3);
}

.dark-mode .kb-list-container {
  background-color: var(--el-bg-color-overlay);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .kb-list-header {
  background-color: var(--el-fill-color-light);
  border-bottom-color: var(--el-border-color);
}

.dark-mode .search-input,
.dark-mode .filter-select {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}

.dark-mode .search-input:focus,
.dark-mode .filter-select:focus {
  border-color: var(--el-color-primary);
}

.dark-mode .search-btn {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-regular);
}

.dark-mode .search-btn:hover {
  background-color: var(--el-fill-color-light);
}

.dark-mode .kb-card {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.dark-mode .kb-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark-mode .kb-card-header {
  background-color: var(--el-fill-color-light);
  border-bottom-color: var(--el-border-color);
}

.dark-mode .type-file {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1));
  color: var(--el-color-primary);
  border: 1px solid rgba(25, 118, 210, 0.3);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
  transition: all 0.3s ease;
}

.dark-mode .type-url {
  background: linear-gradient(135deg, rgba(123, 31, 162, 0.2), rgba(123, 31, 162, 0.1));
  color: #ba68c8;
  border: 1px solid rgba(123, 31, 162, 0.3);
  box-shadow: 0 2px 8px rgba(123, 31, 162, 0.2);
  transition: all 0.3s ease;
}

.dark-mode .type-resource {
  background: linear-gradient(135deg, rgba(56, 142, 60, 0.2), rgba(56, 142, 60, 0.1));
  color: #81c784;
  border: 1px solid rgba(56, 142, 60, 0.3);
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
  transition: all 0.3s ease;
}

.dark-mode .edit-btn {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
  transition: all 0.3s ease;
}

.dark-mode .edit-btn:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.2));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.dark-mode .delete-btn {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.2), rgba(220, 53, 69, 0.1));
  color: #f56565;
  border: 1px solid rgba(220, 53, 69, 0.3);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  transition: all 0.3s ease;
}

.dark-mode .delete-btn:hover {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.3), rgba(220, 53, 69, 0.2));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.dark-mode .kb-name {
  color: var(--el-text-color-primary);
}

.dark-mode .kb-description {
  color: var(--el-text-color-regular);
}

.dark-mode .kb-meta {
  color: var(--el-text-color-secondary);
}

.dark-mode .empty-state {
  color: var(--el-text-color-secondary);
}

.dark-mode .empty-state h3 {
  color: var(--el-text-color-regular);
}

.dark-mode .dialog-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.dark-mode .dialog-content {
  background: linear-gradient(145deg, var(--el-bg-color-overlay), var(--el-fill-color-extra-light));
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--el-border-color-light);
}

.dark-mode .dialog-header {
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color));
  border-bottom-color: var(--el-border-color);
}

.dark-mode .dialog-header h2 {
  color: var(--el-text-color-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dark-mode .close-btn {
  background: linear-gradient(135deg, var(--el-fill-color), var(--el-fill-color-light));
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .close-btn:hover {
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color-dark));
  color: var(--el-text-color-primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .form-section h3 {
  color: var(--el-text-color-primary);
}

.dark-mode .form-group label {
  color: var(--el-text-color-primary);
}

.dark-mode .form-input,
.dark-mode .form-textarea {
  background: linear-gradient(135deg, var(--el-bg-color), var(--el-fill-color-extra-light));
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-primary);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .form-input:focus,
.dark-mode .form-textarea:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, var(--el-fill-color-extra-light), var(--el-bg-color));
}

.dark-mode .source-tab {
  background: linear-gradient(135deg, var(--el-bg-color), var(--el-fill-color-light));
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .source-tab:hover {
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .source-tab.active {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  color: var(--el-color-white);
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.dark-mode .source-content {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.dark-mode .upload-area {
  border: 2px dashed var(--el-border-color);
  background: linear-gradient(135deg, var(--el-fill-color-extra-light), var(--el-bg-color));
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .upload-area:hover {
  border-color: var(--el-color-primary);
  background: linear-gradient(135deg, var(--el-bg-color), var(--el-fill-color-light));
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.dark-mode .upload-icon {
  color: var(--el-text-color-disabled);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.dark-mode .upload-placeholder p {
  color: var(--el-text-color-regular);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dark-mode .empty-icon {
  color: var(--el-text-color-disabled);
}

.dark-mode .upload-link {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  color: var(--el-color-white);
  border: 1px solid var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.dark-mode .upload-link:hover {
  background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.dark-mode .upload-hint {
  color: var(--el-text-color-secondary);
}

.dark-mode .file-item,
.dark-mode .url-item {
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color));
  border: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .file-item:hover,
.dark-mode .url-item:hover {
  background: linear-gradient(135deg, var(--el-fill-color), var(--el-fill-color-dark));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .file-name,
.dark-mode .url-text {
  color: var(--el-text-color-primary);
}

.dark-mode .file-size {
  color: var(--el-text-color-secondary);
}

.dark-mode .remove-file-btn,
.dark-mode .remove-url-btn {
  background: linear-gradient(135deg, var(--el-color-danger), var(--el-color-danger-light-3));
  color: var(--el-color-white);
  border: 1px solid var(--el-color-danger);
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
  transition: all 0.3s ease;
}

.dark-mode .remove-file-btn:hover,
.dark-mode .remove-url-btn:hover {
  background: linear-gradient(135deg, var(--el-color-danger-light-3), var(--el-color-danger));
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4);
}

.dark-mode .add-url-btn {
  background: linear-gradient(135deg, var(--el-color-success), var(--el-color-success-light-3));
  color: var(--el-color-white);
  border: 1px solid var(--el-color-success);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease;
}

.dark-mode .add-url-btn:hover {
  background: linear-gradient(135deg, var(--el-color-success-light-3), var(--el-color-success));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.dark-mode .radio-option {
  color: var(--el-text-color-primary);
}

.dark-mode .resource-items {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.dark-mode .resource-item {
  border-bottom-color: var(--el-border-color-lighter);
}

.dark-mode .resource-item:hover {
  background-color: var(--el-fill-color-light);
}

.dark-mode .resource-item.selected {
  background-color: rgba(64, 158, 255, 0.2);
}

.dark-mode .resource-name {
  color: var(--el-text-color-primary);
}

.dark-mode .resource-meta {
  color: var(--el-text-color-secondary);
}

.dark-mode .dialog-footer {
  border-top-color: var(--el-border-color);
}

.dark-mode .cancel-btn {
  background-color: var(--el-color-info);
}

.dark-mode .save-btn {
  background-color: var(--el-color-primary);
}

.dark-mode .save-btn:disabled {
  background-color: var(--el-color-info-light-5);
  color: var(--el-text-color-disabled);
}

@media (max-width: 768px) {
  .knowledge-base-manager-container {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .kb-list-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .kb-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog-content {
    width: 95%;
    margin: 20px;
  }
  
  .source-tabs {
    flex-direction: column;
  }
  
  .url-input-group {
    flex-direction: column;
  }
}
</style>