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
}