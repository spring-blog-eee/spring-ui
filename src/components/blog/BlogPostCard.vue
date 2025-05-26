<template>
  <router-link :to="`/blog/${post.id}`" class="blog-card">
    <div class="blog-cover">
      <img :src="post.cover" :alt="post.title" loading="lazy" />
      <div class="blog-tags">
        <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
    
    <div class="blog-content">
      <h3 class="blog-title">{{ post.title }}</h3>
      <p class="blog-excerpt">{{ post.excerpt }}</p>
      
      <div class="blog-meta">
        <div class="author-info">
          <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
          <span class="author-name">{{ post.author.name }}</span>
        </div>
        
        <div class="blog-date">{{ formatDate(post.publishedAt) }}</div>
      </div>
      
      <div class="blog-stats">
        <div class="stat">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ post.comments }}</span>
        评论
        </div>
        <div class="stat">
          <el-icon><Star /></el-icon>
          <span>{{ post.likes }}</span>
        赞
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps } from 'vue'
import dayjs from 'dayjs'

// Define props
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// Format date
const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY')
}
</script>

<style scoped>
.blog-card {
  display: block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none;
  color: inherit;
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.dark-mode) .blog-card {
  background-color: #222;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3);
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
}

:deep(.dark-mode) .blog-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
}

.blog-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.blog-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.blog-card:hover .blog-cover img {
  transform: scale(1.05);
}

.blog-tags {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background-color: rgba(2, 136, 209, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.blog-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

:deep(.dark-mode) .blog-title {
  color: #f1f5f9;
}

.blog-excerpt {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1;
}

:deep(.dark-mode) .blog-excerpt {
  color: #cbd5e1;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
}

:deep(.dark-mode) .author-name {
  color: #e2e8f0;
}

.blog-date {
  font-size: 0.85rem;
  color: #94a3b8;
}

.blog-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.stat :deep(svg) {
  font-size: 1rem;
}
</style>