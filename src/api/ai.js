import axios from "axios";

const prefix = '/api/llm'

export const aiApi = {
    getModels()
    {
        return axios.get(prefix + '/model/list')
    },
    chat(params)
    {
        return axios.post(prefix + '/ai/chat', params)
    },
    getConversationHistory(userId)
    {
        return axios.get(prefix + '/model/history/' + userId)
    },
    deleteConversation(conversationId)
    {
        return axios.delete(prefix + '/model/history-conversation/' + conversationId)   
    },
    getOneConversation(conversationId)
    {
        return axios.get(prefix + '/model/history-conversation/' + conversationId)
    },
    updateConversation(params)
    {
        return axios.post(prefix + '/model/history-conversation/update', params)
    },


    createKnowledge(params)
    {
        return axios.post(prefix + '/rag/create', params)
    },
    getKnowledgeList(params)
    {
        return axios.post(prefix + '/rag/list', params)
    },
    deleteKnowledge(params)
    {
        return axios.post(prefix + '/rag/delete', params)
    },
    updateKnowledge(params)
    {
        return axios.post(prefix + '/rag/update', params)
    },
    getUploadFileUrl(params)
    {
        return axios.post(prefix + '/rag/get-urls', params)
    },
    loadFileIntoKnowledge(params)
    {
        return axios.post(prefix + '/rag/finish-upload', params)
    }

}