<template>
  <div class="blog-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1>博客文章</h1>
        <div class="filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
          <el-select v-model="selectedTag" placeholder="按标签筛选" clearable @change="handleTagFilter">
            <el-option
              v-for="tag in tags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>
      </div>

      <!-- Blog posts grid -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="blogs.length" class="blog-grid">
        <BlogPostCard
          v-for="blog in blogs"
          :key="blog.id"
          :post="blog"
        />
      </div>

      <div v-else class="empty-state">
        <el-empty description="未找到文章" />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBlogStore } from '../stores/blog'
import BlogPostCard from '../components/blog/BlogPostCard.vue'

const blogStore = useBlogStore()

// State
const searchQuery = ref('')
const selectedTag = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const loading = ref(false)

// Computed
const blogs = computed(() => blogStore.blogs)
const total = computed(() => blogStore.pagination.total)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const tags = computed(() => blogStore.tags)

// Methods
const fetchBlogs = async () => {
  loading.value = true
  try {
    await blogStore.fetchBlogs({
      pageIndex: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value,
      tag: selectedTag.value
    })
  } catch (error) {
    console.error('获取博客失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchBlogs()
}

const handleTagFilter = () => {
  currentPage.value = 1
  fetchBlogs()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchBlogs()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchBlogs(),
    blogStore.fetchTags()
  ])
})
</script>

<style scoped>
.blog-page {
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

:deep(.dark-mode) .page-header h1 {
  color: #f1f5f9;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>