import axios from "axios";

export const aiApi = {
    getModels()
    {
        return axios.get('/llm/model/list')
    },
    chat(params)
    {
        return axios.post('/llm/ai/chat', params)
    },
    getConversationHistory(userId)
    {
        return axios.get('/llm/model/history/' + userId)
    },
    deleteConversation(conversationId)
    {
        return axios.delete('/llm/model/history-conversation/' + conversationId)
    },
    getOneConversation(conversationId)
    {
        return axios.get('/llm/model/history-conversation/' + conversationId)
    },


    createKnowledge(params)
    {
        return axios.post('/llm/rag/create', params)
    },
    getKnowledgeList(params)
    {
        return axios.post('/llm/rag/list', params)
    },
    deleteKnowledge(params)
    {
        return axios.post('/llm/rag/delete', params)
    },
    updateKnowledge(params)
    {
        return axios.post('/llm/rag/update', params)
    },

}