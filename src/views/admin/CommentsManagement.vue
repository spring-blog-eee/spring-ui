<template>
  <div class="comments-management">
    <h2>Manage Comments</h2>
    
    <div class="table-actions">
      <el-input
        v-model="searchQuery"
        placeholder="Search comments..."
        prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
      
      <el-select v-model="filterStatus" placeholder="Filter by status" @change="handleStatusFilter">
        <el-option label="All" value="" />
        <el-option label="Pending" value="pending" />
        <el-option label="Approved" value="approved" />
      </el-select>
    </div>
    
    <el-table
      v-loading="loading"
      :data="comments"
      style="width: 100%"
    >
      <el-table-column prop="content" label="Comment" min-width="300">
        <template #default="{ row }">
          <div class="comment-content">
            <p>{{ row.content }}</p>
            <router-link :to="`/blog/${row.blogId}`" class="blog-link">
              on: {{ row.blogTitle }}
            </router-link>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="author.name" label="Author" width="150" />
      
      <el-table-column prop="createdAt" label="Posted" width="150">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="Status" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'approved' ? 'success' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            link
            @click="handleApprove(row)"
          >
            <el-icon><Check /></el-icon>
            Approve
          </el-button>
          
          <el-button type="danger" link @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useCommentStore } from '../../stores/comment'

const commentStore = useCommentStore()

// State
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const comments = ref([])
const total = ref(0)

// Methods
const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY')
}

const fetchComments = async () => {
  loading.value = true
  try {
    const response = await commentStore.fetchAllComments({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value,
      status: filterStatus.value
    })
    comments.value = response.comments
    total.value = response.total
  } catch (error) {
    ElMessage.error('Failed to fetch comments')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComments()
}

const handleStatusFilter = () => {
  currentPage.value = 1
  fetchComments()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
}

const handleApprove = async (comment) => {
  try {
    await commentStore.approveComment(comment.id)
    ElMessage.success('Comment approved successfully')
    fetchComments()
  } catch (error) {
    ElMessage.error('Failed to approve comment')
  }
}

const handleDelete = async (comment) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this comment?',
      'Warning',
      {
        confirmButtonText: '删除',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await commentStore.deleteComment(comment.id)
    ElMessage.success('Comment deleted successfully')
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete comment')
    }
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comments-management {
  margin-top: 2rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

:deep(.dark-mode) h2 {
  color: #f1f5f9;
}

.table-actions {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-content p {
  margin: 0;
  color: #334155;
}

:deep(.dark-mode) .comment-content p {
  color: #e2e8f0;
}

.blog-link {
  font-size: 0.875rem;
  color: var(--el-color-primary);
  text-decoration: none;
}

.blog-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .table-actions {
    flex-direction: column;
  }
}
</style>
```