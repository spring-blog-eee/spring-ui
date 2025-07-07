<template>
  <div class="home-container">
    <!-- Hero section -->
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text">
          <h1>在 <span>SpringBlog</span><br class="mobile-break"> 分享你的故事</h1>
          <p>eee的个人技术博客，记录编程心得、分享生活感悟。在这里，思想自由绽放，知识持续积累。</p>
          <div class="hero-buttons">
            <router-link to="/blog" class="btn-primary">
              浏览文章 <el-icon><ArrowRight /></el-icon>
            </router-link>
            <router-link v-if="!userStore.isLoggedIn" to="/register" class="btn-secondary">
              开始使用
            </router-link>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Featured posts section -->
    <section class="featured-section">
      <div class="container section-header">
        <h2>特色文章</h2>
        <router-link to="/blog" class="view-all">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      
      <div class="container featured-posts">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
          <el-skeleton :rows="3" animated />
          <el-skeleton :rows="3" animated />
        </div>
        
        <template v-else>
          <BlogPostCard 
            v-for="post in featuredPosts" 
            :key="post.id" 
            :post="post" 
          />
        </template>
      </div>
    </section>
    
    <!-- Newsletter section -->
    <section class="newsletter-section">
      <div class="container newsletter-content">
        <h2>订阅我们的新闻通讯</h2>
        <p>及时了解最新故事和平台更新。</p>
        
        <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
          <el-input
            v-model="newsletterEmail"
            placeholder="你的电子邮件地址"
            class="newsletter-input"
          />
          <el-button type="primary" native-type="submit">订阅</el-button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import BlogPostCard from '../components/blog/BlogPostCard.vue'

const userStore = useUserStore()
const featuredPosts = ref([])
const loading = ref(true)
const newsletterEmail = ref('')

// Mock featured posts data for demo
const loadFeaturedPosts = () => {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    featuredPosts.value = [
      {
        id: 1,
        title: 'Vue 3 Composition API 入门',
        excerpt: '学习 Vue 3 Composition API 的基础知识以及它如何改变我们构建 Vue 应用程序的方式。',
        author: {
          name: 'Alex Johnson',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        cover: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg',
        publishedAt: '2025-01-15T10:00:00Z',
        tags: ['Vue', 'JavaScript', 'Frontend'],
        likes: 42,
        comments: 12
      },
      {
        id: 2,
        title: '使用 CSS Grid 构建响应式布局',
        excerpt: '探索 CSS Grid 如何彻底改变你的网页布局，让响应式设计比以往任何时候都更容易。',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://i.pravatar.cc/150?img=5'
        },
        cover: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
        publishedAt: '2025-01-10T14:30:00Z',
        tags: ['CSS', 'Web Design', 'Responsive'],
        likes: 36,
        comments: 8
      },
      {
        id: 3,
        title: '每个开发者都应该知道的现代 JavaScript 特性',
        excerpt: '一份关于提升代码质量和生产力的必备 JavaScript 特性的全面指南。',
        author: {
          name: 'Michael Rodriguez',
          avatar: 'https://i.pravatar.cc/150?img=8'
        },
        cover: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg',
        publishedAt: '2025-01-05T09:15:00Z',
        tags: ['JavaScript', 'ES6', 'Programming'],
        likes: 29,
        comments: 5
      }
    ]
    loading.value = false
  }, 1000)
}

const subscribeNewsletter = () => {
  if (!newsletterEmail.value) {
    ElMessage.warning('请输入你的电子邮件地址')
    return
  }
  
  // Simulate API call
  ElMessage.success('感谢你订阅我们的新闻通讯！')
  newsletterEmail.value = ''
}

onMounted(() => {
  loadFeaturedPosts()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero section */
.hero-section {
  padding: 8rem 0 5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaff 100%);
  position: relative;
}

.dark-mode .hero-section {
  background: url(../assets/title-img.png) no-repeat center/cover,
              linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%);
  background-blend-mode: overlay;
}

.hero-content {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.hero-text {
  max-width: 800px;
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1e293b;
  background: url(../assets/title-img.png) no-repeat center/120% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.dark-mode .hero-text h1 {
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
  color: var(--el-text-color-primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.dark-mode .hero-text h1 span {
  color: transparent !important;
  background: linear-gradient(135deg, #6db33f 0%, #5cb85c 100%);
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow: none;
}

.hero-text h1 span {
  color: transparent;
}

.hero-text p {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.dark-mode .hero-text p {
  color: var(--el-text-color-secondary);
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  background-color: #0288d1;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #0277bd;
}

.btn-secondary {
  background-color: transparent;
  color: #0288d1;
  border: 1px solid #0288d1;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.btn-secondary:hover {
  background-color: rgba(2, 136, 209, 0.1);
}

/* Featured posts section */
.featured-section {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.dark-mode .section-header h2 {
  color: var(--el-text-color-primary);
}

.view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0288d1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.view-all:hover {
  color: #0277bd;
}

.featured-posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
}

/* Newsletter section */
.newsletter-section {
  padding: 4rem 0;
  background-color: #f8fafc;
}

.dark-mode .newsletter-section {
  background-color: var(--el-fill-color);
}

.newsletter-content {
  text-align: center;
  max-width: 600px;
}

.newsletter-content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.dark-mode .newsletter-content h2 {
  color: var(--el-text-color-primary);
}

.newsletter-content p {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.dark-mode .newsletter-content p {
  color: var(--el-text-color-secondary);
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input {
  flex: 1;
}

/* 移动端换行控制 */
.mobile-break {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .mobile-break {
    display: block;
  }
  
  .hero-text h1 {
    font-size: 2.5rem;
    line-height: 1.2;
  }
  
  .hero-text p {
    font-size: 1.1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .btn-primary,
  .btn-secondary {
    text-align: center;
    justify-content: center;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-form button {
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>