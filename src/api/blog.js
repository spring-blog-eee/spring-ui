import api from './axios'

export const blogApi = {
  // Get all blogs
  getBlogs(params) {
    return api.get('/blogs', { params })
  },
  
  // Get blog by ID
  getBlogById(id) {
    return api.get(`/blogs/${id}`)
  },
  
  // Create a blog (admin)
  createBlog(blogData) {
    return api.post('/admin/blogs', blogData)
  },
  
  // Update a blog (admin)
  updateBlog(id, blogData) {
    return api.put(`/admin/blogs/${id}`, blogData)
  },
  
  // Delete a blog (admin)
  deleteBlog(id) {
    return api.delete(`/admin/blogs/${id}`)
  },
  
  // Like a blog
  likeBlog(id) {
    return api.post(`/blogs/${id}/like`)
  },
  
  // Get tags
  getTags() {
    return api.get('/blogs/tags')
  },
  
  // Get featured blogs
  getFeaturedBlogs() {
    return api.get('/blogs/featured')
  },
  
  // Upload image for blog
  uploadImage(formData) {
    return api.post('/blogs/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}