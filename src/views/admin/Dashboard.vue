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
      
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  posts: 0,
  comments: 0,
  users: 0
})

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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```