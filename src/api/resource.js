import axios from "axios";

const prefix = 'resource'
export const resourceApi = {
    getPublicResources()
    {
        return axios.get(`/${prefix}/oss/public/list`)
    },
    getDownloadUrl(params)
    {
        return axios.post(`/${prefix}/oss/public/download/url`, params)
    },
    getPrivateResource()
    {
        return axios.get(`/${prefix}/oss/private/list`)
    }
} 