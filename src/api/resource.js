import axios from "axios";

const prefix = 'resources'
export const resourceApi = {
    getPublicResources(params)
    {
        return axios.post(`/${prefix}/oss/public/list`, params)
    },
    getDownloadUrl(params)
    {
        return axios.post(`/${prefix}/oss/public/download/url`, params)
    },
    getPrivateResource(params)
    {
        return axios.post(`/${prefix}/oss/private/list`, params)
    },
    getPublicCount()
    {
        return axios.get(`/${prefix}/oss/public/count`)
    },
    getPrivateCount(params)
    {
        return axios.post(`/${prefix}/oss/private/count`, params)
    },
    deleteResource(params)
    {
        return axios.post(`/${prefix}/oss/delete`, params)
    },
    getOssSignature(params)
    {
        return axios.post(`/${prefix}/oss/add`, params)
    },
    getPrivateUsage(params)
    {
        return axios.post(`/${prefix}/oss/private/usage`, params)
    }
}