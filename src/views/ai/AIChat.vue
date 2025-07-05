<template>
  <div class="ai-chat-container">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="new-chat-button">
        <button class="new-chat-btn">+ 新建对话</button>
      </div>
      <div class="chat-list">
        <div 
          v-for="conversation in conversationHistory" 
          :key="conversation.conversationId || conversation.id"
          class="chat-item" 
          :class="{ active: currentConversationId === (conversation.conversationId || conversation.id) }"
          @click="selectConversation(conversation)"
        >
          <i class="icon-chat"></i>
          <span>{{ conversation.title || conversation.firstMessage || '对话' }}</span>
        </div>
      </div>
      <div class="settings-section">
        <div class="model-select">
          <label for="model-dropdown">选择模型</label>
          <select id="model-dropdown" v-model="selectedModel">
            <option v-for="item in models" :key="item.id || item.modelName" :value="item.modelName">{{ item.modelName }}</option>
          </select>
        </div>
        <div class="knowledge-base-select">
          <div class="kb-header">
            <label for="kb-dropdown">选择知识库</label>
            <button class="manage-kb-button" @click="goToKnowledgeBaseManager">管理知识库</button>
          </div>
          <select id="kb-dropdown">
            <option>个人知识库</option>
            <option>公共知识库</option>
          </select>
        </div>
      </div>
    </aside>

    <!-- 主对话区域 -->
    <main class="chat-main">
      <div class="chat-header">
        <div class="chat-title">知识库小助手</div>
        <div class="chat-actions">
        </div>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <!-- 对话消息将在这里显示 -->
        <div v-if="messages.length === 0" class="empty-state">
          <p>👋 您好！我是您的AI助手，有什么可以帮助您的吗？</p>
        </div>
        
        <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input 
          type="text" 
          placeholder="输入您的问题..." 
          class="chat-input" 
          v-model="userInput"
          @keyup.enter="sendMessage"
        />
        <button class="send-button" @click="sendMessage">
          <i class="icon-send"></i>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { aiApi } from '../../api/ai.js';
import { useUserStore } from '../../stores/user.js';

const router = useRouter();
const userStore = useUserStore();
const models = ref([]);
const selectedModel = ref('');
const userInput = ref('');
const currentConversationId = ref('');
const messages = ref([]);
const loading = ref(false);
const messagesContainer = ref(null);
const conversationHistory = ref([]);

const goToKnowledgeBaseManager = () => {
  router.push('/knowledge-base-manager'); // 假设知识库管理页面的路由是 /knowledge-base-manager
};

// 开始新对话
const startNewConversation = () => {
  currentConversationId.value = '';
  messages.value = [];
};

// 选择历史对话
const selectConversation = async (conversation) => {
  try {
    const conversationId = conversation.conversationId || conversation.id;
    currentConversationId.value = conversationId;
    
    // 获取该对话的消息历史
    const result = await aiApi.getOneConversation(conversationId);
    if (result.data && result.data.code === 200 && result.data.data) {
      // 将API返回的消息格式转换为组件使用的格式
      messages.value = result.data.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type === 'USER' ? 'user' : 'assistant',
        timestamp: msg.timestamp
      }));
    } else {
      messages.value = [];
    }
  } catch (error) {
    console.error('获取对话消息历史失败:', error);
    messages.value = [];
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 获取历史会话
const getConversationHistory = async () => {
  try {
    const result = await aiApi.getConversationHistory(userStore.user?.id || 8);
    if (result.data && result.data.code === 200 && result.data.data && result.data.data.length > 0) {
      // 保存历史会话数据
      conversationHistory.value = result.data.data;
      // 获取最新的conversationId（假设数组按时间排序，最后一个是最新的）
      const latestConversation = result.data.data[result.data.data.length - 1];
      currentConversationId.value = latestConversation.conversationId || latestConversation.id || '';
    }
  } catch (error) {
    console.error('获取历史会话失败:', error);
  }
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return;
  
  // 如果conversationId为空，先获取历史会话
  if (!currentConversationId.value) {
    await getConversationHistory();
  }
  
  const question = userInput.value.trim();
  userInput.value = ''; // 清空输入框
  
  // 添加用户消息到聊天记录
  messages.value.push({
    type: 'user',
    content: question,
    timestamp: new Date()
  });
  
  // 添加一个空的AI消息用于流式更新
  const aiMessageIndex = messages.value.length;
  messages.value.push({
    type: 'assistant',
    content: '',
    timestamp: new Date()
  });
  
  scrollToBottom();
  
  try {
    loading.value = true;
    
    const params = {
      question: question,
      model: selectedModel.value || 'claude-4.0-sonnet',
      conversationId: currentConversationId.value || '',
      userId: userStore.user?.id || 8,
      knowledge: null
    };
    
    // 使用fetch处理流式响应
    const response = await fetch('/llm/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;
      
      // 更新AI消息内容
      messages.value[aiMessageIndex].content = accumulatedContent;
      scrollToBottom();
    }
    
    // 如果没有收到任何内容，显示默认消息
    if (!accumulatedContent.trim()) {
      messages.value[aiMessageIndex].content = '抱歉，我无法回答这个问题。';
    }
    
  } catch (error) {
    console.error('发送消息失败:', error);
    // 移除空的AI消息并添加错误消息
    messages.value.splice(aiMessageIndex, 1);
    messages.value.push({
      type: 'error',
      content: '发送消息失败，请稍后重试。',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

onMounted(async () => {
  // 获取模型列表
  let result = await aiApi.getModels();
  result = result.data

  console.log(result)

  if(result.code !== 200)
  {
    return;
  }
  models.value = result.data;
  
  if (models.value.length > 0) {
    selectedModel.value = models.value[0].modelName;
  }
  
  // 获取历史会话
  await getConversationHistory();
});

// 这里可以添加组件的逻辑，例如：
// - 处理新建对话的点击事件
// - 管理对话列表的状态
// - 处理模型和知识库的选择
// - 发送和接收消息的逻辑
// - 滚动到底部等

// 示例：导入一些图标（假设您有Element Plus或其他图标库）
// import { Sunny, Moon } from '@element-plus/icons-vue'

// 响应式数据示例
// import { ref } from 'vue';
// const currentModel = ref('GPT-4 (OpenAI)');
// const currentKnowledgeBase = ref('个人知识库');
// const messages = ref([]);

// 方法示例
// const startNewChat = () => { /* ... */ };
// const sendMessage = () => { /* ... */ };
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: calc(100vh - 60px); /* 假设头部高度为60px，根据实际情况调整 */
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
}

.sidebar {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 15px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

.new-chat-button {
  margin-bottom: 20px;
}

.new-chat-btn {
  width: 100%;
  padding: 12px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.new-chat-btn:hover {
  background-color: #0056b3;
}

.chat-list {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background-color: #e9ecef;
}

.chat-item.active {
  background-color: #e0eaff;
  color: #007bff;
  font-weight: bold;
}

.chat-item .icon-chat {
  margin-right: 10px;
  /* 假设图标样式 */
}

.chat-item span {
  flex-grow: 1;
}

.chat-date {
  font-size: 12px;
  color: #6c757d;
}

.settings-section {
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.model-select,
.knowledge-base-select {
  margin-bottom: 15px;
}

.model-select label,
.knowledge-base-select label {
  display: block;
  font-size: 14px;
  color: #343a40;
  margin-bottom: 5px;
}

.model-select select,
.knowledge-base-select select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #f8f9fa;
  font-size: 14px;
  cursor: pointer;
}

.chat-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  position: relative;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.chat-title {
  font-size: 18px;
  font-weight: bold;
  color: #343a40;
}

.chat-actions i {
  margin-left: 15px;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.chat-messages {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px); /* 设置最大高度，确保滚动条生效 */
  min-height: 0; /* 确保flex子元素可以收缩 */
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.empty-state {
  text-align: center;
  color: #adb5bd;
  font-size: 16px;
  padding: 50px;
}

.message-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message-item.user {
  align-items: flex-end;
}

.message-item.assistant {
  align-items: flex-start;
}

.message-item.error {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message-item.user .message-content {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .message-content {
  background-color: #f1f3f4;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-item.error .message-content {
  background-color: #fee;
  color: #d63384;
  border: 1px solid #f5c6cb;
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.message-item.assistant .message-time {
  text-align: left;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}

.typing-indicator span {
  height: 4px;
  width: 4px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  margin-right: 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  gap: 10px;
}

.chat-input {
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #007bff;
}

.send-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-button:hover {
  background-color: #0056b3;
}

.send-button .icon-send {
  /* 假设图标样式 */
  font-size: 18px;
}

/* 简单的图标占位符 */
.icon-chat::before {
  content: '💬';
}
.icon-moon::before {
  content: '🌙';
}
.icon-info::before {
  content: 'ℹ️';
}
.icon-send::before {
  content: '➤';
}
</style>

<style scoped>
.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.manage-kb-button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #E0EAFF;
  cursor: pointer;
  font-size: 12px;
  color: #007bff;
  transition: background-color 0.2s ease;
}

.manage-kb-button:hover {
  background-color: #d0e0ff;
}

/* 黑夜模式样式 */
.dark-mode {
  .ai-chat-container {
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
  }
  
  .sidebar {
    background-color: var(--el-bg-color);
    border-right-color: var(--el-border-color);
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }
  
  .new-chat-btn {
    background-color: var(--el-color-primary);
    color: white;
  }
  
  .new-chat-btn:hover {
    background-color: var(--el-color-primary-dark);
  }
  
  .chat-item {
    color: var(--el-text-color-regular);
  }
  
  .chat-item:hover {
    background-color: var(--el-fill-color-light);
  }
  
  .chat-item.active {
    background-color: var(--el-fill-color-darker);
    color: var(--el-color-primary);
  }
  
  .chat-date {
    color: var(--el-text-color-secondary);
  }
  
  .settings-section {
    border-top-color: var(--el-border-color);
  }
  
  .model-select label,
  .knowledge-base-select label {
    color: var(--el-text-color-primary);
  }
  
  .model-select select,
  .knowledge-base-select select {
    background-color: var(--el-fill-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
  
  .model-select select:focus,
  .knowledge-base-select select:focus {
    border-color: var(--el-color-primary);
  }
  
  .manage-kb-button {
    background-color: var(--el-fill-color-darker);
    border-color: var(--el-border-color);
    color: var(--el-color-primary);
  }
  
  .manage-kb-button:hover {
    background-color: var(--el-fill-color-dark);
  }
  
  .chat-main {
    background-color: var(--el-bg-color);
  }
  
  .chat-header {
    background-color: var(--el-fill-color-light);
    border-bottom-color: var(--el-border-color);
  }
  
  .chat-title {
    color: var(--el-text-color-primary);
  }
  
  .chat-actions i {
    color: var(--el-text-color-secondary);
  }
  
  .chat-actions i:hover {
    color: var(--el-text-color-primary);
  }
  
  .empty-state {
    color: var(--el-text-color-placeholder);
  }
  
  .chat-input-area {
    background-color: var(--el-fill-color-light);
    border-top-color: var(--el-border-color);
  }
  
  .chat-input {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
  
  .chat-input::placeholder {
    color: var(--el-text-color-placeholder);
  }
  
  .chat-input:focus {
    border-color: var(--el-color-primary);
  }
  
  .send-button {
    background-color: var(--el-color-primary);
  }
  
  .send-button:hover {
    background-color: var(--el-color-primary-dark);
  }
  
  .message-item.user .message-content {
    background-color: var(--el-color-primary);
    color: white;
  }
  
  .message-item.assistant .message-content {
    background-color: var(--el-fill-color-darker);
    color: var(--el-text-color-primary);
  }
  
  .message-item.error .message-content {
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    border-color: var(--el-color-danger-light-7);
  }
  
  .message-text {
    color: inherit;
  }
  
  .typing-indicator span {
    background-color: var(--el-text-color-secondary);
  }
  
  /* 夜间模式滚动条样式 */
  .chat-messages::-webkit-scrollbar-track {
    background: var(--el-fill-color);
  }
  
  .chat-messages::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
  }
  
  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: var(--el-text-color-disabled);
  }
}
</style>