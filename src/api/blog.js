import axios from "axios"

const prefix = '/blogs'

export const blogApi = {
  // Get upload URLs for blog creation
  getUploadUrls(params)
  {
    return axios.post(prefix + '/blog/add', params)
  },
  // Get all blogs
  getBlogList(params)
  {
    return axios.post(prefix + '/blog/list', params)
  },
  getBlogDetail(params)
  {
    return axios.post(prefix + '/blog/get', params)
  },
  getTop3Blogs(params)
  {
    return axios.post(prefix + '/blog/list-top', params)
  },
  shiftTopBlog(params)
  {
    return axios.post(prefix + '/blog/shift-top', params)
  },
  deleteBlog(params)
  {
    return axios.post(prefix + '/blog/delete', params)
  }
}