import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { blogApi } from '../api/blog'
import MarkdownIt from 'markdown-it'

export const useBlogStore = defineStore('blog', () => {
  const blogs = ref([])
  const currentBlog = ref(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
  })
  const loading = ref(false)
  const error = ref(null)
  const tags = ref([])

  // Get all blogs with pagination
  async function fetchBlogs(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.getBlogList({
        pageIndex: params.pageIndex || params.page || pagination.value.page || 1,
        ...params
      })
      
      // 处理响应数据结构
      if (response.data && response.data.code === 200) {
        const blogData = response.data.data || []
        
        // 处理博客数据，解析tags字段并转换为组件期望的格式
        blogs.value = blogData.map(blog => ({
          ...blog,
          id: blog.id,
          title: blog.title,
          cover: blog.imgUrl || '/default-cover.jpg',
          excerpt: blog.excerpt || '暂无摘要...',
          tags: JSON.parse(blog.tags),
          author: {
            name: blog.nickname || '匿名用户',
            avatar: blog.authorAvatar || 'https://img-bsy.txrpic.com/Element/00/88/63/12/549f4792_E886312_4b2c4691XZ.png?imageMogr2/quality/90/thumbnail/320x%3E'
          },
          publishedAt: blog.creationTime,
          createdAt: blog.creationTime,
          // 保留原始数据
        }))

        console.log(blogs.value)
        
        // 更新分页信息（这里假设后端会返回总数，如果没有则使用当前数据长度）
         pagination.value = {
           page: params.pageIndex || params.page || pagination.value.page || 1,
           limit: params.limit || pagination.value.limit || 10,
           total: response.data.total || blogData.length // 优先使用后端返回的总数
         }
      } else {
        blogs.value = []
        throw new Error(response.data?.message || 'Failed to fetch blogs')
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch blogs'
      blogs.value = []
    } finally {
      loading.value = false
    }
  }

  // Get a single blog by ID
  async function fetchBlogById(id) {
    try {
      loading.value = true
      
      // 确保ID是数字类型
      const blogId = parseInt(id)
      console.log('Fetching blog with ID:', blogId)
      
      // 调用 getBlogDetail API 获取博客详情
      const response = await blogApi.getBlogDetail({ id: blogId })
      console.log('API response:', response)
      
      if (response.data && response.data.code === 200) {
        const blogData = response.data.data
        console.log('Blog data:', blogData)
        
        // 解析标签
        let parsedTags = []
        try {
          parsedTags = JSON.parse(blogData.tags || '[]')
        } catch (e) {
          console.log('Failed to parse tags:', e)
          parsedTags = []
        }
        
        // 拉取 markdown 文件内容
        const markdownResponse = await fetch(blogData.contentUrl)
        const markdownContent = await markdownResponse.text()
        
        // 使用 markdown-it 渲染 markdown 内容
        const md = new MarkdownIt({  
          html: false,
          linkify: true,
          typographer: true
        })
        const renderedContent = md.render(markdownContent)
        
        // 构建完整的博客对象
        currentBlog.value = {
          id: blogData.id,
          title: blogData.title,
          content: renderedContent,
          cover: blogData.imgUrl || '/default-cover.jpg',
          tags: parsedTags,
          author: {
            name: blogData.nickname || '匿名用户',
            avatar: 'https://img-bsy.txrpic.com/Element/00/88/63/12/549f4792_E886312_4b2c4691XZ.png?imageMogr2/quality/90/thumbnail/320x%3E'
          },
          publishedAt: blogData.creationTime || new Date().toISOString(),
          createdAt: blogData.creationTime || new Date().toISOString(),
          likes: 0,
          liked: false
        }
        
        console.log('Current blog set:', currentBlog.value)
        return currentBlog.value
      } else {
        console.log('API response error (ignored):', response.data)
        // 设置默认博客内容而不抛出错误
        currentBlog.value = {
          id: blogId,
          title: '博客标题',
          content: '<p>内容加载中...</p>',
          cover: '/default-cover.jpg',
          tags: [],
          author: {
            name: '匿名用户',
            avatar: 'https://img-bsy.txrpic.com/Element/00/88/63/12/549f4792_E886312_4b2c4691XZ.png?imageMogr2/quality/90/thumbnail/320x%3E'
          },
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          likes: 0,
          liked: false
        }
        return currentBlog.value
      }
    } catch (err) {
      console.log('Error in fetchBlogById (ignored):', err)
      // 设置默认博客内容而不抛出错误
      currentBlog.value = {
        id: parseInt(id),
        title: '博客标题',
        content: '<p>内容加载中...</p>',
        cover: '/default-cover.jpg',
        tags: [],
        author: {
          name: '匿名用户',
          avatar: 'https://img-bsy.txrpic.com/Element/00/88/63/12/549f4792_E886312_4b2c4691XZ.png?imageMogr2/quality/90/thumbnail/320x%3E'
        },
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        likes: 0,
        liked: false
      }
      return currentBlog.value
    } finally {
      loading.value = false
    }
  }

  // Create a new blog
  async function createBlog(blogData) {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.createBlog(blogData)
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to create blog'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update an existing blog
  async function updateBlog(id, blogData) {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.updateBlog(id, blogData)
      
      // Update the blog in the list if it exists
      const index = blogs.value.findIndex(blog => blog.id === id)
      if (index !== -1) {
        blogs.value[index] = response.data
      }
      
      // Update current blog if it's the one being edited
      if (currentBlog.value && currentBlog.value.id === id) {
        currentBlog.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to update blog'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete a blog
  async function deleteBlog(id) {
    try {
      loading.value = true
      error.value = null
      await blogApi.deleteBlog(id)
      
      // Remove from list
      blogs.value = blogs.value.filter(blog => blog.id !== id)
      
      // Clear current blog if it's the one being deleted
      if (currentBlog.value && currentBlog.value.id === id) {
        currentBlog.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete blog'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Like a blog
  async function likeBlog(id) {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.likeBlog(id)
      
      // Update the blog in the list if it exists
      const index = blogs.value.findIndex(blog => blog.id === id)
      if (index !== -1) {
        blogs.value[index].likes = response.data.likes
        blogs.value[index].liked = response.data.liked
      }
      
      // Update current blog if it's the one being liked
      if (currentBlog.value && currentBlog.value.id === id) {
        currentBlog.value.likes = response.data.likes
        currentBlog.value.liked = response.data.liked
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to like blog'
      throw error.value
    } finally {
      loading.value = false
    }
  }


  // Get featured blogs
  async function fetchFeaturedBlogs() {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.getFeaturedBlogs()
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch featured blogs'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    blogs,
    currentBlog,
    pagination,
    loading,
    error,
    tags,
    fetchBlogs,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    fetchFeaturedBlogs
  }
})