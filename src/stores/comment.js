import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { commentApi } from '../api/comment'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([])
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
  })
  const loading = ref(false)
  const error = ref(null)

  // Get comments for a blog
  async function fetchComments(blogId, params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await commentApi.getComments(blogId, {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      comments.value = response.data.comments
      pagination.value = {
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total
      }
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch comments'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Add a comment
  async function addComment(blogId, content) {
    try {
      loading.value = true
      error.value = null
      const response = await commentApi.addComment(blogId, { content })
      comments.value.unshift(response.data)
      pagination.value.total += 1
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to add comment'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Delete a comment
  async function deleteComment(commentId) {
    try {
      loading.value = true
      error.value = null
      await commentApi.deleteComment(commentId)
      comments.value = comments.value.filter(c => c.id !== commentId)
      pagination.value.total -= 1
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete comment'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Get all comments (admin)
  async function fetchAllComments(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await commentApi.getAllComments({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      comments.value = response.data.comments
      pagination.value = {
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total
      }
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch all comments'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Approve a comment
  async function approveComment(commentId) {
    try {
      loading.value = true
      error.value = null
      const response = await commentApi.approveComment(commentId)
      
      // Update the comment in the list
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to approve comment'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    pagination,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment,
    fetchAllComments,
    approveComment
  }
})