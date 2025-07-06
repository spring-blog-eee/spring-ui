<template>
  <div class="ai-chat-container">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="new-chat-button">
        <button class="new-chat-btn" @click="startNewConversation" :disabled="isStartingNewChat">
          <span v-if="!isStartingNewChat">+ 新建对话</span>
          <span v-else>创建中...</span>
        </button>
      </div>
      <div class="chat-list">
        <div 
          v-for="conversation in conversationHistory" 
          :key="conversation.conversationId || conversation.id"
          class="chat-item" 
          :class="{ active: currentConversationId === (conversation.conversationId || conversation.id) }"
        >
          <div class="chat-item-content" @click="selectConversation(conversation)">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ conversation.title || conversation.firstMessage || '对话' }}</span>
          </div>
          <el-icon 
            class="delete-icon" 
            @click.stop="deleteConversation(conversation)"
            title="删除对话"
          >
            <Delete />
          </el-icon>
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
            <div class="message-text" 
                 v-if="message.type === 'user'">{{ message.content }}</div>
            <div class="message-text markdown-content" 
                 v-else 
                 v-html="renderMarkdown(message.content)"></div>
            <!-- <div class="message-time">{{ formatTime(message.timestamp) }}</div> -->
          </div>
        </div>
        
        <!-- AI响应加载动画 -->
        <div v-if="isAiResponding" class="message-item assistant">
          <div class="message-content">
            <div class="ai-loading">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="loading-text">小助手思考中...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="input-row">
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
        <div class="function-buttons">
          <button class="function-btn search-btn" @click="toggleWebSearch" :class="{ active: isWebSearchEnabled }">
            <Search class="function-icon" />
            <span>联网搜索</span>
          </button>
          <button class="function-btn tool-btn" @click="toggleToolCall" :class="{ active: isToolCallEnabled }">
            <Tools class="function-icon" />
            <span>工具调用</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { aiApi } from '../../api/ai.js';
import { useUserStore } from '../../stores/user.js';
import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import markdownItPrism from 'markdown-it-prism';
import { ChatDotRound, Delete, Search, Tools } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';

// 导入常用语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';

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
const isStartingNewChat = ref(false);
const isAiResponding = ref(false);
const isWebSearchEnabled = ref(false);
const isToolCallEnabled = ref(false);

// 初始化markdown渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(markdownItPrism, {plugins:[]});

// 渲染markdown内容
const renderMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
};

const goToKnowledgeBaseManager = () => {
  router.push('/knowledge-base-manager'); // 假设知识库管理页面的路由是 /knowledge-base-manager
};

// 开始新对话
const startNewConversation = async () => {
  // 防止重复点击
  if (isStartingNewChat.value) return;
  
  try {
    isStartingNewChat.value = true;
    
    // 重置对话状态
    currentConversationId.value = '';
    messages.value = [];
    userInput.value = '';
    loading.value = false;
    
    // 滚动到顶部
    await scrollToBottom();
    
    // 刷新历史会话列表（可选，如果需要从服务器获取最新状态）
    // await getConversationHistory();
    
  } catch (error) {
    console.error('创建新对话失败:', error);
  } finally {
    isStartingNewChat.value = false;
  }
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

// 切换联网搜索功能
const toggleWebSearch = () => {
  isWebSearchEnabled.value = !isWebSearchEnabled.value;
  if (isWebSearchEnabled.value) {
    console.log('联网搜索功能已启用');
  } else {
    console.log('联网搜索功能已禁用');
  }
};

// 切换工具调用功能
const toggleToolCall = () => {
  isToolCallEnabled.value = !isToolCallEnabled.value;
  if (isToolCallEnabled.value) {
    console.log('工具调用功能已启用');
  } else {
    console.log('工具调用功能已禁用');
  }
};

// 删除历史对话
const deleteConversation = async (conversation) => {
  try {
    const conversationId = conversation.conversationId || conversation.id;
    const conversationTitle = conversation.title || conversation.firstMessage || '对话';
    
    // 使用 Element Plus 确认弹窗
    await ElMessageBox.confirm(
      `确定要删除对话 "${conversationTitle}" 吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    // 调用删除 API
    const result = await aiApi.deleteConversation(conversationId);
    
    if (result.data && result.data.code === 200) {
      // 删除成功提示
      ElMessage.success('对话删除成功');
      
      // 如果删除的是当前选中的对话，清空消息列表和当前对话ID
      if (currentConversationId.value === conversationId) {
        currentConversationId.value = '';
        messages.value = [];
      }
      
      // 重新获取历史会话列表
      await getConversationHistory();
    } else {
      ElMessage.error('删除失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除对话失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
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
      // 返回最新的会话记录（列表第一条）
      return result.data.data[0];
    }
    return null;
  } catch (error) {
    console.error('获取历史会话失败:', error);
    return null;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return;
  
  const question = userInput.value.trim();
  userInput.value = ''; // 清空输入框
  
  // 添加用户消息到聊天记录
  messages.value.push({
    type: 'user',
    content: question,
    timestamp: new Date()
  });
  
  scrollToBottom();
  
  try {
    loading.value = true;
    isAiResponding.value = true; // 开始显示加载动画
    
    // 根据联网搜索状态调整模型名称
    let modelName = selectedModel.value || 'deepseek-v3-0324';
    if (isWebSearchEnabled.value) {
      modelName += '?search';
    }
    
    const params = {
      question: question,
      model: modelName,
      conversationId: currentConversationId.value || '',
      userId: userStore.user?.id || 8,
      knowledge: null,
      toolCalling: isToolCallEnabled.value
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
    let aiMessageIndex = -1;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      accumulatedContent += chunk;
      
      // 如果是第一次接收到数据，隐藏加载动画并添加AI消息
      if (aiMessageIndex === -1) {
        isAiResponding.value = false;
        aiMessageIndex = messages.value.length;
        messages.value.push({
          type: 'assistant',
          content: '',
          timestamp: new Date()
        });
        
        // 如果当前会话ID为空，获取最新会话ID
        if (!currentConversationId.value) {
          try {
            const latestConversation = await getConversationHistory();
            if (latestConversation) {
              currentConversationId.value = latestConversation.conversationId || latestConversation.id || '';
            }
          } catch (error) {
            console.error('获取最新会话ID失败:', error);
          }
        }
      }
      
      // 更新AI消息内容
      messages.value[aiMessageIndex].content = accumulatedContent;
      scrollToBottom();
    }
    
    // 如果没有收到任何内容，显示默认消息
    if (!accumulatedContent.trim()) {
      if (aiMessageIndex === -1) {
        // 如果还没有创建AI消息，先创建一个
        isAiResponding.value = false;
        aiMessageIndex = messages.value.length;
        messages.value.push({
          type: 'assistant',
          content: '抱歉，我无法回答这个问题。',
          timestamp: new Date()
        });
      } else {
        messages.value[aiMessageIndex].content = '抱歉，我无法回答这个问题。';
      }
    }
    
  } catch (error) {
    console.error('发送消息失败:', error);
    // 隐藏加载动画
    isAiResponding.value = false;
    // 添加错误消息
    messages.value.push({
      type: 'error',
      content: '发送消息失败，请稍后重试。',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
    isAiResponding.value = false; // 确保加载动画被隐藏
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
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
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

.new-chat-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.new-chat-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.new-chat-btn:disabled:hover {
  background-color: #6c757d;
}

.chat-list {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  position: relative;
}

.chat-item:hover {
  background-color: #e9ecef;
}

.chat-item.active {
  background-color: #e0eaff;
  color: #007bff;
  font-weight: bold;
}

.chat-item-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
  cursor: pointer;
  min-width: 0;
}

.chat-item-content .el-icon {
  margin-right: 10px;
  flex-shrink: 0;
}

.chat-item-content span {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-icon {
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
  flex-shrink: 0;
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-item:hover .delete-icon {
  opacity: 1;
}

.delete-icon:hover {
  color: #ff4757;
  background-color: rgba(255, 71, 87, 0.1);
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
  line-height: 1.5;
  word-wrap: break-word;
}

/* Markdown内容样式 */
.markdown-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  padding-left: 8px;
  line-height: 1.7;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.3em; }
.markdown-content h3 { font-size: 1.1em; }

.markdown-content p {
  margin: 8px 0;
}

.markdown-content code {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 12px;
  margin: 12px 0;
  color: #6a737d;
}

.markdown-content table {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #dfe2e5;
  padding: 6px 12px;
  text-align: left;
}

.markdown-content th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
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

/* AI加载动画样式 */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #007bff;
  animation: loading-bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0s;
}

.loading-text {
  font-size: 14px;
  color: #666;
  font-style: italic;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.chat-input-area {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.function-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  margin-top: 8px;
}

.function-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background-color: #f6f8fa;
  color: #656d76;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.function-btn:hover {
  background-color: #f3f4f6;
  border-color: #d0d7de;
}

.function-btn.active {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.function-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 夜间模式样式 */
.dark-mode .function-btn {
  background-color: #21262d;
  border-color: #30363d;
  color: #e6edf3;
}

.dark-mode .function-btn:hover {
  background-color: #30363d;
  border-color: #484f58;
}

.dark-mode .function-btn.active {
  background-color: #1f2937;
  border-color: #3b82f6;
  color: #60a5fa;
}

.dark-mode .chat-input-area {
  background-color: #0d1117;
  border-top-color: #21262d;
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
  
  /* AI加载动画夜间模式样式 */
  .loading-dots span {
    background-color: var(--el-color-primary);
  }
  
  .loading-text {
    color: var(--el-text-color-secondary);
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

/* Prism.js 代码高亮样式优化 */
  .markdown-content pre[class*="language-"] {
    margin: 16px 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    padding: 16px;
    background: #2d3748 !important;
  }
  
  .markdown-content code[class*="language-"],
  .markdown-content pre[class*="language-"] {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    color: #e2e8f0;
  }
  
  .markdown-content code {
    background: #f7fafc;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #e53e3e;
  }
  
  /* 夜间模式下的代码样式 */
  .dark .markdown-content code {
    background: #2d3748;
    color: #68d391;
  }
  
  .dark .markdown-content pre[class*="language-"] {
    background: #1a202c !important;
  }
</style>