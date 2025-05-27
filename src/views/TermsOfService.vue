<template>
  <div class="terms-of-service">
    <div class="container">
      <div class="content">
        <h1>服务条款</h1>
        <p class="last-updated">最后更新：{{ lastUpdated }}</p>
        
        <div class="terms-content">
          <section>
            <h2>1. 服务条款的接受</h2>
            <p>欢迎使用SpringBlog！通过访问和使用我们的网站，您同意遵守并受以下服务条款的约束。如果您不同意这些条款，请不要使用我们的服务。</p>
          </section>

          <section>
            <h2>2. 服务描述</h2>
            <p>SpringBlog是一个博客平台，提供以下服务：</p>
            <ul>
              <li>博客文章的发布和阅读</li>
              <li>用户注册和个人资料管理</li>
              <li>评论和互动功能</li>
              <li>内容搜索和分类</li>
              <li>其他相关的博客服务</li>
            </ul>
          </section>

          <section>
            <h2>3. 用户账户</h2>
            <p>使用我们的服务需要创建账户，您需要：</p>
            <ul>
              <li>提供准确、完整的注册信息</li>
              <li>保护您的账户密码安全</li>
              <li>及时更新您的个人信息</li>
              <li>对您账户下的所有活动负责</li>
              <li>立即通知我们任何未经授权的使用</li>
            </ul>
          </section>

          <section>
            <h2>4. 用户行为规范</h2>
            <p>在使用我们的服务时，您同意不会：</p>
            <ul>
              <li>发布违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</li>
              <li>侵犯他人的知识产权或其他权利</li>
              <li>发布垃圾信息、广告或未经授权的商业内容</li>
              <li>传播病毒、恶意软件或其他有害代码</li>
              <li>干扰或破坏服务的正常运行</li>
              <li>冒充他人或虚假陈述您与他人的关系</li>
            </ul>
          </section>

          <section>
            <h2>5. 内容所有权和许可</h2>
            <p>关于内容的权利和责任：</p>
            <ul>
              <li><strong>您的内容：</strong>您保留对您发布内容的所有权，但授予我们使用、展示、分发您内容的许可</li>
              <li><strong>我们的内容：</strong>网站设计、功能、商标等属于我们的知识产权</li>
              <li><strong>第三方内容：</strong>我们不对用户发布的内容负责，但保留删除违规内容的权利</li>
            </ul>
          </section>

          <section>
            <h2>6. 隐私保护</h2>
            <p>我们重视您的隐私，请查看我们的<router-link to="/privacy-policy" class="link">隐私政策</router-link>了解我们如何收集、使用和保护您的个人信息。</p>
          </section>

          <section>
            <h2>7. 服务的修改和终止</h2>
            <p>我们保留以下权利：</p>
            <ul>
              <li>随时修改或终止服务（或其任何部分）</li>
              <li>暂停或终止违反条款的用户账户</li>
              <li>删除违反条款的内容</li>
              <li>更新这些服务条款</li>
            </ul>
            <p>我们会尽力提前通知重大变更，但不保证在所有情况下都能做到。</p>
          </section>

          <section>
            <h2>8. 免责声明</h2>
            <p>我们的服务按"现状"提供，我们不保证：</p>
            <ul>
              <li>服务将不间断或无错误</li>
              <li>服务将满足您的特定需求</li>
              <li>通过服务获得的信息准确或可靠</li>
              <li>服务中的缺陷将被纠正</li>
            </ul>
          </section>

          <section>
            <h2>9. 责任限制</h2>
            <p>在法律允许的最大范围内，我们不对以下情况承担责任：</p>
            <ul>
              <li>任何间接、偶然、特殊或后果性损害</li>
              <li>利润损失、数据丢失或业务中断</li>
              <li>第三方的行为或内容</li>
              <li>服务的中断或终止</li>
            </ul>
          </section>

          <section>
            <h2>10. 赔偿</h2>
            <p>您同意就因您使用服务或违反这些条款而产生的任何索赔、损失、责任、损害、费用和开支（包括合理的律师费）对我们进行赔偿和免责。</p>
          </section>

          <section>
            <h2>11. 适用法律</h2>
            <p>这些条款受中华人民共和国法律管辖。任何争议将在我们所在地的法院解决。</p>
          </section>

          <section>
            <h2>12. 条款变更</h2>
            <p>我们可能会不时更新这些服务条款。重大变更时，我们会通过网站通知或邮件通知您。继续使用服务即表示您接受修订后的条款。</p>
          </section>

          <section>
            <h2>13. 联系信息</h2>
            <p>如果您对这些服务条款有任何疑问，请联系我们：</p>
            <ul>
              <li>邮箱：legal@springblog.com</li>
              <li>地址：中国北京市朝阳区xxx街道xxx号</li>
              <li>电话：+86-xxx-xxxx-xxxx</li>
            </ul>
          </section>

          <section>
            <h2>14. 其他条款</h2>
            <p>如果这些条款的任何部分被认定为无效或不可执行，其余部分仍然有效。我们未能执行任何条款不构成对该条款的放弃。</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastUpdated = ref('2025年1月15日')
</script>

<style scoped>
.terms-of-service {
  min-height: 100vh;
  padding: 6rem 0 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.dark-mode .terms-of-service {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
}

.terms-of-service::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>') repeat;
  pointer-events: none;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.content {
  background: var(--el-bg-color);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 10px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.dark-mode .content {
  background: rgba(20, 20, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
  background-size: 300% 100%;
  animation: wave 4s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

h1 {
  color: var(--el-text-color-primary);
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark-mode h1 {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.last-updated {
  text-align: center;
  color: var(--el-text-color-secondary);
  margin-bottom: 3rem;
  font-style: italic;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color));
  border-radius: 30px;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  border: 2px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.terms-content {
  line-height: 1.8;
}

section {
  margin-bottom: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, var(--el-fill-color-extra-light), var(--el-fill-color-light));
  border-radius: 20px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dark-mode section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border-color: rgba(255, 255, 255, 0.1);
}

section:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.dark-mode section:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

section::after {
  content: '';
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, var(--el-color-primary-light-7), transparent);
  border-radius: 50%;
  opacity: 0.3;
}

h2 {
  color: var(--el-text-color-primary);
  font-size: 1.7rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-left: 1.5rem;
  padding-top: 0.5rem;
}

h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

h2::after {
  content: attr(data-number);
  position: absolute;
  left: -0.5rem;
  top: -0.5rem;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

p {
  color: var(--el-text-color-regular);
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
  text-align: justify;
  line-height: 1.7;
}

ul {
  margin-left: 0;
  margin-bottom: 1.5rem;
  padding-left: 0;
}

li {
  color: var(--el-text-color-regular);
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: var(--el-bg-color);
  border-radius: 12px;
  border-left: 4px solid var(--el-color-primary-light-5);
  list-style: none;
  position: relative;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-mode li {
  background: rgba(255, 255, 255, 0.04);
  border-left-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

li:hover {
  transform: translateX(8px);
  border-left-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, var(--el-bg-color), var(--el-fill-color-extra-light));
}

.dark-mode li:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
}

li::before {
  content: '⚖️';
  position: absolute;
  left: -0.8rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
  background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-9));
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode strong {
  background: rgba(102, 126, 234, 0.15);
}

.link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, transparent, var(--el-color-primary-light-9));
}

.link:hover {
  background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-7));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 添加进入动画 */
section {
  opacity: 0;
  transform: translateY(30px) rotateX(10deg);
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

section:nth-child(1) { animation-delay: 0.1s; }
section:nth-child(2) { animation-delay: 0.15s; }
section:nth-child(3) { animation-delay: 0.2s; }
section:nth-child(4) { animation-delay: 0.25s; }
section:nth-child(5) { animation-delay: 0.3s; }
section:nth-child(6) { animation-delay: 0.35s; }
section:nth-child(7) { animation-delay: 0.4s; }
section:nth-child(8) { animation-delay: 0.45s; }
section:nth-child(9) { animation-delay: 0.5s; }
section:nth-child(10) { animation-delay: 0.55s; }
section:nth-child(11) { animation-delay: 0.6s; }
section:nth-child(12) { animation-delay: 0.65s; }
section:nth-child(13) { animation-delay: 0.7s; }
section:nth-child(14) { animation-delay: 0.75s; }

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

/* 添加浮动动画 */
.content {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .content {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  h2 {
    font-size: 1.4rem;
    padding-left: 1.2rem;
  }
  
  section {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
  
  .last-updated {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
  }
  
  li {
    padding: 0.8rem 1.2rem;
  }
}

@media (max-width: 480px) {
  .terms-of-service {
    padding: 5rem 0 2rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .content {
    padding: 1.5rem 1rem;
  }
  
  section {
    padding: 1.5rem 1rem;
  }
  
  h2 {
    font-size: 1.2rem;
    padding-left: 1rem;
  }
}
</style> 