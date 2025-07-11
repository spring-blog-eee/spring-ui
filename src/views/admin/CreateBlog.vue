<template>
  <div class="create-blog">
    <div class="container">
      <div class="page-header">
        <h1>创建新的博客文章</h1>
      </div>
      
      <el-form
        ref="formRef"
        :model="blogForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="blogForm.title" placeholder="输入博客标题" />
        </el-form-item>
        
        <el-form-item label="封面图片" prop="cover">
          <el-upload
            class="cover-upload"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept="image/*"
          >
            <div v-if="!coverPreview" class="upload-placeholder">
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处或<em>点击选择</em>
              </div>
            </div>
            <div v-else class="cover-preview">
              <img :src="coverPreview" alt="封面预览" class="preview-image" />
              <div class="preview-overlay">
                <el-button type="primary" size="small" @click.stop="changeCover">更换图片</el-button>
                <el-button type="danger" size="small" @click.stop="removeCover">删除</el-button>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <div class="tag-input-container">
            <div class="tags-display">
              <el-tag
                v-for="(tag, index) in blogForm.tags"
                :key="index"
                closable
                @close="removeTag(index)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <el-input
              v-model="tagInput"
              placeholder="输入标签后按回车添加"
              @keyup.enter="addTag($event)"
              class="tag-input"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <div id="vditor-container" class="editor-container"></div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            发布文章
          </el-button>
          <el-button @click="handle取消">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '../../stores/theme'
import { useBlogStore } from '../../stores/blog'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const router = useRouter()
const themeStore = useThemeStore()
const blogStore = useBlogStore()
const formRef = ref(null)
const loading = ref(false)
let vditorInstance = null
const isDark = computed(() => themeStore.isDark)

// Form data
const blogForm = reactive({
  title: '',
  cover: '',
  tags: [],
  content: ''
})

// 标签输入相关
const tagInput = ref('')

// 封面图片相关
const coverPreview = ref('')
const coverFile = ref(null)

// Form validation rules
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, message: '标题至少需要 3 个字符', trigger: 'blur' }
  ],
  cover: [
    { required: true, message: '请上传封面图片', trigger: 'change' }
  ],
  tags: [
    { required: true, message: '请至少添加一个标签', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少添加一个标签', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请填写内容', trigger: 'blur' },
    { min: 100, message: '内容至少需要 100 个字符', trigger: 'blur' }
  ]
}

// Methods
const handleFileChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  
  coverFile.value = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target.result
    blogForm.cover = 'pending' // 标记为待上传
  }
  reader.readAsDataURL(file.raw)
}

const changeCover = () => {
  // 触发文件选择
  const uploadInput = document.querySelector('.cover-upload input[type="file"]')
  if (uploadInput) {
    uploadInput.click()
  }
}

const removeCover = () => {
  coverPreview.value = ''
  coverFile.value = null
  blogForm.cover = ''
}

const uploadCoverImage = async () => {
  if (!coverFile.value) return ''
  
  const formData = new FormData()
  formData.append('file', coverFile.value)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    return result.url
  } catch (error) {
    console.error('封面上传失败:', error)
    throw new Error('封面图片上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 如果有封面图片需要上传，先上传封面
    if (blogForm.cover === 'pending' && coverFile.value) {
      ElMessage.info('正在上传封面图片...')
      blogForm.cover = await uploadCoverImage()
    }
    
    blogForm.content = vditorInstance.getValue()
    const response = await blogStore.createBlog(blogForm)
    ElMessage.success('博客文章发布成功')
    router.push(`/blog/${response.id}`)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handle取消 = () => {
  router.back()
}

// 标签相关方法
const addTag = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  const tag = tagInput.value.trim()
  if (tag && !blogForm.tags.includes(tag)) {
    blogForm.tags.push(tag)
    tagInput.value = '' // 清空输入框
  } else if (blogForm.tags.includes(tag)) {
    ElMessage.warning('标签已存在')
  }
}

const removeTag = (index) => {
  blogForm.tags.splice(index, 1)
}

onMounted(async () => {

  // 等待DOM完全渲染后再初始化Vditor
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Initialize Vditor
  try {
    vditorInstance = new Vditor('vditor-container', {
      height: 500,
      width: '100%',
      mode: 'ir',
      theme: isDark.value ? 'dark' : 'classic',
      placeholder: '请输入文章内容...',
      cache: {
        enable: false
      },
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'upload',
        'table',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'preview'
      ],
      after: () => {
        console.log('Vditor initialized successfully')
        vditorInstance.setValue(blogForm.content)
        // 存储 vditor 实例到 DOM 元素上，以便主题切换时使用
        const container = document.querySelector('#vditor-container')
        if (container) {
          container.vditor = vditorInstance
        }
      }
    })
  } catch (error) {
    console.error('Vditor initialization failed:', error)
    ElMessage.error('编辑器初始化失败，请刷新页面重试')
  }
})

// 监听主题变化
watch(isDark, (newValue) => {
  if (vditorInstance) {
    vditorInstance.setTheme(newValue ? 'dark' : 'classic')
  }
})

// 组件卸载时清理vditor实例
onUnmounted(() => {
  if (vditorInstance) {
    vditorInstance.destroy()
    vditorInstance = null
  }
})
</script>

<style scoped>
.create-blog {
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
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

.cover-upload {
  width: 100%;
  border: 1px dashed #d4d4d4;
  border-radius: 6px;
}

:deep(.dark-mode) .cover-upload {
  border-color: #4a4a4a;
}

.upload-placeholder {
  padding: 40px;
  text-align: center;
}

.cover-preview {
  position: relative;
  width: 100%;
  max-height: 300px;
  min-height: 150px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-preview:hover .preview-overlay {
  opacity: 1;
}

:deep(.dark-mode) .cover-preview {
  background-color: #2d3748;
}

:deep(.dark-mode) .preview-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.editor-container {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  min-height: 500px;
  width: 100%;
}

:deep(.dark-mode) .editor-container {
  border-color: #2d3748;
}

:deep(.vditor) {
  border: none !important;
  width: 100% !important;
}

:deep(.vditor-content) {
  min-height: 450px;
}

/* 确保vditor在夜间模式下正确显示 */
:deep(.dark-mode .vditor) {
  background-color: #1a202c;
  color: #e2e8f0;
}

:deep(.dark-mode .vditor-toolbar) {
  background-color: #2d3748;
  border-bottom-color: #4a5568;
}

:deep(.dark-mode .vditor-content) {
  background-color: #1a202c;
  color: #e2e8f0;
}

/* 标签输入组件样式 */
.tag-input-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  min-height: 40px;
  background-color: #fff;
  transition: border-color 0.2s;
}

.tag-input-container:hover {
  border-color: #c0c4cc;
}

.tag-input-container:focus-within {
  border-color: #409eff;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag-item {
  margin: 0;
}

.tag-input {
  border: none;
  box-shadow: none;
}

.tag-input :deep(.el-input__wrapper) {
  box-shadow: none;
  background-color: transparent;
}

/* 夜间模式样式 */
:deep(.dark-mode) .tag-input-container {
  background-color: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

:deep(.dark-mode) .tag-input-container:hover {
  border-color: #718096;
}

:deep(.dark-mode) .tag-input-container:focus-within {
  border-color: #409eff;
}
</style>