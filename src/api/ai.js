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
    getOneConversation(conversationId)
    {
        return axios.get('/llm/model/history-conversation/' + conversationId)
    }
}