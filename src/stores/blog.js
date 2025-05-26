import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { blogApi } from '../api/blog'

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
      const response = await blogApi.getBlogs({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      blogs.value = response.data.blogs
      pagination.value = {
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch blogs'
    } finally {
      loading.value = false
    }
  }

  // Get a single blog by ID
  async function fetchBlogById(id) {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.getBlogById(id)
      currentBlog.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch blog'
      throw error.value
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

  // Get all tags
  async function fetchTags() {
    try {
      loading.value = true
      error.value = null
      const response = await blogApi.getTags()
      tags.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch tags'
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
    fetchTags,
    fetchFeaturedBlogs
  }
})