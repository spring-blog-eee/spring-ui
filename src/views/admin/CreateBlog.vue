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
            action="/api/upload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="blogForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加或选择标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
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

// Available tags
const availableTags = ref([
  'Vue',
  'JavaScript',
  'TypeScript',
  'Frontend',
  'Backend',
  'Programming'
])

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
const handleUploadSuccess = (response) => {
  blogForm.cover = response.url
  ElMessage.success('封面图片上传成功')
}

const handleUploadError = () => {
  ElMessage.error('封面图片上传失败')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
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

onMounted(async () => {
  // Fetch available tags
  try {
    const tags = await blogStore.fetchTags()
    availableTags.value = tags
  } catch (error) {
    console.error('获取标签失败:', error)
  }

  // Initialize Vditor
  vditorInstance = new Vditor('vditor-container', {
    height: 500,
    width: '100%',
    mode: 'ir',
    theme: isDark.value ? 'dark' : 'classic',
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
      vditorInstance.setValue(blogForm.content)
      // 存储 vditor 实例到 DOM 元素上，以便主题切换时使用
      document.querySelector('#vditor-container').vditor = vditorInstance
    }
  })
  
  // 监听主题变化
  watch(isDark, (newValue) => {
    if (vditorInstance) {
      vditorInstance.setTheme(newValue ? 'dark' : 'classic')
    }
  })
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
  border: 1px dashed #d4d4d4;
  border-radius: 6px;
}

:deep(.dark-mode) .cover-upload {
  border-color: #4a4a4a;
}

.editor-container {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.dark-mode) .editor-container {
  border-color: #2d3748;
}

:deep(.vditor) {
  border: none;
}
</style>
```