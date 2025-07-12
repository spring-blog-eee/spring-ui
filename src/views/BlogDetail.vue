<template>
  <div class="blog-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="container">
        <el-skeleton :rows="10" animated />
      </div>
    </div>

    <template v-else-if="blog">
      <!-- Blog cover at top -->
      <div class="blog-cover-hero">
        <img :src="blog.cover" :alt="blog.title" />
        <div class="cover-overlay">
          <div class="container">
            <h1 class="blog-title-overlay">{{ blog.title }}</h1>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Blog header -->
        <div class="blog-header">
          <div class="blog-meta">
            <div class="author-info">
              <div class="author-details">
                <span class="author-name">{{ blog.author.name }}</span>
                <span class="publish-date">{{ formatDate(blog.publishedAt) }}</span>
              </div>
            </div>
            <div class="blog-actions">
              <el-button type="primary" plain @click="handleLike">
                <el-icon><Star /></el-icon>
                {{ blog.likes }} 个赞
              </el-button>
            </div>
          </div>

          <div class="blog-tags">
            <el-tag
              v-for="tag in blog.tags"
              :key="tag"
              size="small"
              effect="plain"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- Blog content -->
        <div class="blog-content markdown-body" v-html="blog.content"></div>

        <!-- Comments section -->
        <div class="comments-section">
          <h2>评论 ({{ totalComments }})</h2>

          <!-- Add comment -->
          <div v-if="userStore.isLoggedIn" class="add-comment">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="撰写评论..."
            />
            <el-button
              type="primary"
              :loading="submittingComment"
              @click="submitComment"
            >
              发表评论
            </el-button>
          </div>
          <div v-else class="login-prompt">
            <router-link to="/login" class="login-link">登录以发表评论</router-link>
          </div>

          <!-- Comments list -->
          <div class="comments-list">
            <div v-if="loadingComments" class="loading-comments">
              <el-skeleton :rows="3" animated />
              <el-skeleton :rows="3" animated />
            </div>

            <template v-else>
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment"
              >
                <div class="comment-header">
                  <div class="comment-author">
                    <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-avatar" />
                    <div class="comment-meta">
                      <span class="comment-author-name">{{ comment.author.name }}</span>
                      <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                  </div>
                  <el-button
                    v-if="can删除Comment(comment)"
                    type="danger"
                    link
                    @click="deleteComment(comment.id)"
                  >
                    删除
                  </el-button>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>

              <!-- Comments pagination -->
              <div v-if="totalPages > 1" class="comments-pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="totalComments"
                  layout="prev, pager, next"
                  @current-change="fetchComments"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
  

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useBlogStore } from '../stores/blog'
import { useCommentStore } from '../stores/comment'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const commentStore = useCommentStore()
const userStore = useUserStore()

// State
const loading = ref(false)
const loadingComments = ref(false)
const submittingComment = ref(false)

const newComment = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Computed
const blog = computed(() => blogStore.currentBlog)
const comments = computed(() => commentStore.comments)
const totalComments = computed(() => commentStore.pagination.total)
const totalPages = computed(() => Math.ceil(totalComments.value / pageSize.value))

// Methods
const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY')
}

const fetchBlog = async () => {
  loading.value = true
  
  try {
    await blogStore.fetchBlogById(route.params.id)
    await fetchComments()
  } catch (err) {
    console.log('Blog loading error (ignored):', err)
  } finally {
    loading.value = false
  }
}

const fetchComments = async (page = 1) => {
  // loadingComments.value = true
  // currentPage.value = page
  
  // try {
  //   await commentStore.fetchComments(route.params.id, {
  //     page: currentPage.value,
  //     limit: pageSize.value
  //   })
  // } catch (err) {
  //   ElMessage.error('加载评论失败')
  // } finally {
  //   loadingComments.value = false
  // }
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  try {
    await blogStore.likeBlog(route.params.id)
    ElMessage.success(blog.value.liked ? 'Post unliked' : 'Post liked')
  } catch (err) {
    ElMessage.error('Failed to like post')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('Please write a comment')
    return
  }
  
  submittingComment.value = true
  
  try {
    await commentStore.addComment(route.params.id, newComment.value.trim())
    newComment.value = ''
    ElMessage.success('Comment posted successfully')
  } catch (err) {
    ElMessage.error('Failed to post comment')
  } finally {
    submittingComment.value = false
  }
}

const deleteComment = async (commentId) => {
  try {
    await commentStore.deleteComment(commentId)
    ElMessage.success('Comment deleted successfully')
  } catch (err) {
    ElMessage.error('Failed to delete comment')
  }
}

const can删除Comment = (comment) => {
  return userStore.isAdmin || (userStore.user && comment.author.id === userStore.user.id)
}

// Lifecycle
onMounted(() => {
  fetchBlog()
})
</script>

<style scoped>
.blog-detail {
  margin: 0;
  padding: 0;
}

.loading-container {
  padding: 2rem 0;
}

.loading-container .container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero cover section */
.blog-cover-hero {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
}

.blog-cover-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 3rem 0 2rem;
}

.blog-title-overlay {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

/* Content section */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.blog-header {
  padding: 2rem 0 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

:deep(.dark-mode) .blog-header {
  border-bottom-color: #334155;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1e293b;
}

:deep(.dark-mode) .author-name {
  color: #f1f5f9;
}

.publish-date {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

:deep(.dark-mode) .publish-date {
  color: #94a3b8;
}

.blog-actions {
  display: flex;
  gap: 0.5rem;
}

.blog-actions .el-button {
  color: white !important;
  border-color: var(--el-color-primary) !important;
}

.blog-actions .el-button:hover {
  background-color: var(--el-color-primary) !important;
  color: white !important;
}

.blog-actions .el-button .el-icon {
  color: inherit !important;
}

.blog-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.875rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .blog-cover-hero {
    height: 50vh;
    min-height: 300px;
  }
  
  .blog-title-overlay {
    font-size: 2rem;
  }
  
  .cover-overlay {
    padding: 2rem 0 1.5rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .blog-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.blog-content {
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.8;
}

/* Markdown 样式 */
.markdown-body {
  color: #334155;
}

:deep(.dark-mode) .markdown-body {
  color: #e2e8f0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #1e293b;
}

:deep(.dark-mode) .markdown-body h1,
:deep(.dark-mode) .markdown-body h2,
:deep(.dark-mode) .markdown-body h3,
:deep(.dark-mode) .markdown-body h4,
:deep(.dark-mode) .markdown-body h5,
:deep(.dark-mode) .markdown-body h6 {
  color: #f1f5f9;
}

.markdown-body h1 {
  font-size: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

:deep(.dark-mode) .markdown-body h1 {
  border-bottom-color: #2d3748;
}

.markdown-body h2 {
  font-size: 1.5rem;
}

.markdown-body h3 {
  font-size: 1.25rem;
}

.markdown-body p {
  margin-bottom: 1rem;
}

.markdown-body ul,
.markdown-body ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-body li {
  margin-bottom: 0.5rem;
}

.markdown-body blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #64748b;
}

:deep(.dark-mode) .markdown-body blockquote {
  border-left-color: #2d3748;
  color: #94a3b8;
}

.markdown-body code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

:deep(.dark-mode) .markdown-body code {
  background-color: #2d3748;
}

.markdown-body pre {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

:deep(.dark-mode) .markdown-body pre {
  background-color: #1e1e1e;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  text-align: left;
}

:deep(.dark-mode) .markdown-body th,
:deep(.dark-mode) .markdown-body td {
  border-color: #2d3748;
}

.markdown-body th {
  background-color: #f8fafc;
  font-weight: 600;
}

:deep(.dark-mode) .markdown-body th {
  background-color: #1e1e1e;
}

.markdown-body a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
}

:deep(.dark-mode) .markdown-body hr {
  border-top-color: #2d3748;
}

.comments-section {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

:deep(.dark-mode) .comments-section {
  border-top-color: #2d3748;
}

.comments-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

:deep(.dark-mode) .comments-section h2 {
  color: #f1f5f9;
}

.add-comment {
  margin-bottom: 2rem;
}

.add-comment .el-button {
  margin-top: 1rem;
}

.login-prompt {
  text-align: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 2rem;
}

:deep(.dark-mode) .login-prompt {
  background-color: #1e1e1e;
}

.login-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

.comment {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.dark-mode) .comment {
  border-bottom-color: #2d3748;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-meta {
  display: flex;
  flex-direction: column;
}

.comment-author-name {
  font-weight: 500;
  color: #1e293b;
}

:deep(.dark-mode) .comment-author-name {
  color: #f1f5f9;
}

.comment-date {
  font-size: 0.875rem;
  color: #64748b;
}

:deep(.dark-mode) .comment-date {
  color: #94a3b8;
}

.comment-content {
  color: #334155;
  line-height: 1.6;
}

:deep(.dark-mode) .comment-content {
  color: #e2e8f0;
}

.comments-pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .blog-title {
    font-size: 2rem;
  }
  
  .blog-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>