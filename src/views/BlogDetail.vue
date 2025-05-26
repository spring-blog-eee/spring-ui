<template>
  <div class="blog-detail">
    <div class="container">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <template v-else-if="blog">
        <!-- Blog header -->
        <div class="blog-header">
          <div class="blog-meta">
            <div class="author-info">
              <img :src="blog.author.avatar" :alt="blog.author.name" class="author-avatar" />
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

          <h1 class="blog-title">{{ blog.title }}</h1>

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

        <!-- Blog cover -->
        <div class="blog-cover">
          <img :src="blog.cover" :alt="blog.title" />
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
      </template>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <el-result
          icon="error"
          title="加载博客文章失败"
          :sub-title="error"
        >
          <template #extra>
            <router-link to="/blog">
              <el-button type="primary">返回博客</el-button>
            </router-link>
          </template>
        </el-result>
      </div>
    </div>
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
const error = ref(null)
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
  error.value = null
  
  try {
    await blogStore.fetchBlogById(route.params.id)
    await fetchComments()
  } catch (err) {
    error.value = err.message || 'Failed to load blog post'
  } finally {
    loading.value = false
  }
}

const fetchComments = async (page = 1) => {
  loadingComments.value = true
  currentPage.value = page
  
  try {
    await commentStore.fetchComments(route.params.id, {
      page: currentPage.value,
      limit: pageSize.value
    })
  } catch (err) {
    ElMessage.error('加载评论失败')
  } finally {
    loadingComments.value = false
  }
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
  padding: 2rem 0;
}

.loading-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.blog-header {
  max-width: 800px;
  margin: 0 auto 2rem;
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

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: #1e293b;
}

:deep(.dark-mode) .author-name {
  color: #f1f5f9;
}

.publish-date {
  font-size: 0.875rem;
  color: #64748b;
}

:deep(.dark-mode) .publish-date {
  color: #94a3b8;
}

.blog-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #1e293b;
}

:deep(.dark-mode) .blog-title {
  color: #f1f5f9;
}

.blog-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.875rem;
}

.blog-cover {
  max-width: 1000px;
  margin: 0 auto 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.blog-cover img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.blog-content {
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.8;
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