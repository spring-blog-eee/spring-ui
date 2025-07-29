import axios from 'axios'

const prefix = '/api/blogs'

export const commentApi = 
{
  addComment(params)
  {
    return axios.post(prefix + '/comment/add', params)
  },
  deleteComment(params)
  {
    return axios.post(prefix + '/comment/delete', params)
  },
  getComments(params)
  {
    return axios.post(prefix + '/comment/list', params)
  },
  getAllComments(params)
  {
    return axios.post(prefix + '/comment/admin/list', params)
  },
  approveComment(commentId)
  {
    return axios.post(prefix + '/comment/approve', { id: commentId })
  },
  addCommentToTop(params)
  {
    return axios.post(prefix + '/comment/add-top', params)
  },
  cancelCommentToTop(params)
  {
    return axios.post(prefix + '/comment/cancel-top', params)
  },
  getCommentCount(params)
  {
    return axios.post(prefix + '/comment/get-count', params)
  },

}