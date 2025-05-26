import api from './axios'

export const commentApi = {
  // Get comments for a blog
  getComments(blogId, params) {
    return api.get(`/blogs/${blogId}/comments`, { params })
  },
  
  // Add a comment
  addComment(blogId, data) {
    return api.post(`/blogs/${blogId}/comments`, data)
  },
  
  // Delete a comment
  deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`)
  },
  
  // Admin: Get all comments
  getAllComments(params) {
    return api.get('/admin/comments', { params })
  },
  
  // Admin: Approve a comment
  approveComment(commentId) {
    return api.post(`/admin/comments/${commentId}/approve`)
  }
}