import axios from "axios"

const prefix = '/blogs'

export const likeApi = {
  getLikeCount(params)
  {
    return axios.post(prefix + '/like/count', params)
  },
  addLike(params)
  {
    return axios.post(prefix + '/like/add', params)
  },
  deleteLike(params)
  {
    return axios.post(prefix + '/like/delete', params)
  },
  isLiked(params)
  {
    return axios.post(prefix + '/like/is-liked', params)
  }
}