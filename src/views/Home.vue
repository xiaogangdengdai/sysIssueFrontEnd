<template>
  <div class="home-container">
    <!-- 背景动画层 -->
    <div class="bg-animation">
      <div class="particle" v-for="i in 50" :key="i"></div>
    </div>

    <!-- 主内容 -->
    <div class="content">
      <!-- 标题区域 -->
      <div class="header">
        <h1 class="title">
          <span class="gradient-text">氧屋AI助手</span>
        </h1>
        <p class="subtitle">智能开发辅助平台 · 让开发更高效</p>
      </div>

      <!-- 功能卡片区域 -->
      <div class="feature-grid">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="feature-card"
          @click="navigateTo(feature.path)"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="icon-wrapper" :style="{ background: feature.gradient }">
              <span class="icon">{{ feature.icon }}</span>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer">
        <p>Powered by AI · Version 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    id: 1,
    title: '开发助手',
    description: 'bug修复、新功能开发、原有功能改造',
    icon: '🔧',
    path: '/dev-assistant',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: '页面原型快速实现',
    description: '输入描述或上传文档，快速生成HTML页面原型',
    icon: '🎨',
    path: '/html-fast-implement',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: '后台类深度分析',
    description: '输入Java类或方法名，AI全方位解析',
    icon: '☕',
    path: '/java-analysis',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: '前端模块深度分析',
    description: '输入VUE页面地址，AI全方位解析',
    icon: '📊',
    path: '/vue-analysis',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    title: '代码Review报告',
    description: '输入代码要求，生成专业的Review报告',
    icon: '📝',
    path: '/code-review',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0c0c1e 100%);
  position: relative;
  overflow: hidden;
}

/* 背景粒子动画 */
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(100, 150, 255, 0.6);
  border-radius: 50%;
  animation: float 15s infinite;
}

.particle:nth-child(odd) {
  background: rgba(150, 100, 255, 0.6);
}

@keyframes float {
  0%, 100% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) translateX(100px);
    opacity: 0;
  }
}

/* 为每个粒子设置不同的位置和延迟 */
.particle:nth-child(1) { left: 2%; animation-delay: 0s; animation-duration: 12s; }
.particle:nth-child(2) { left: 4%; animation-delay: 1s; animation-duration: 14s; }
.particle:nth-child(3) { left: 6%; animation-delay: 2s; animation-duration: 16s; }
.particle:nth-child(4) { left: 8%; animation-delay: 3s; animation-duration: 13s; }
.particle:nth-child(5) { left: 10%; animation-delay: 4s; animation-duration: 15s; }
.particle:nth-child(6) { left: 12%; animation-delay: 0.5s; animation-duration: 17s; }
.particle:nth-child(7) { left: 14%; animation-delay: 1.5s; animation-duration: 11s; }
.particle:nth-child(8) { left: 16%; animation-delay: 2.5s; animation-duration: 14s; }
.particle:nth-child(9) { left: 18%; animation-delay: 3.5s; animation-duration: 16s; }
.particle:nth-child(10) { left: 20%; animation-delay: 4.5s; animation-duration: 12s; }
.particle:nth-child(11) { left: 22%; animation-delay: 0.3s; animation-duration: 15s; }
.particle:nth-child(12) { left: 24%; animation-delay: 1.3s; animation-duration: 13s; }
.particle:nth-child(13) { left: 26%; animation-delay: 2.3s; animation-duration: 17s; }
.particle:nth-child(14) { left: 28%; animation-delay: 3.3s; animation-duration: 14s; }
.particle:nth-child(15) { left: 30%; animation-delay: 4.3s; animation-duration: 16s; }
.particle:nth-child(16) { left: 32%; animation-delay: 0.7s; animation-duration: 12s; }
.particle:nth-child(17) { left: 34%; animation-delay: 1.7s; animation-duration: 15s; }
.particle:nth-child(18) { left: 36%; animation-delay: 2.7s; animation-duration: 13s; }
.particle:nth-child(19) { left: 38%; animation-delay: 3.7s; animation-duration: 17s; }
.particle:nth-child(20) { left: 40%; animation-delay: 4.7s; animation-duration: 14s; }
.particle:nth-child(21) { left: 42%; animation-delay: 0.2s; animation-duration: 16s; }
.particle:nth-child(22) { left: 44%; animation-delay: 1.2s; animation-duration: 12s; }
.particle:nth-child(23) { left: 46%; animation-delay: 2.2s; animation-duration: 15s; }
.particle:nth-child(24) { left: 48%; animation-delay: 3.2s; animation-duration: 13s; }
.particle:nth-child(25) { left: 50%; animation-delay: 4.2s; animation-duration: 17s; }
.particle:nth-child(26) { left: 52%; animation-delay: 0.4s; animation-duration: 14s; }
.particle:nth-child(27) { left: 54%; animation-delay: 1.4s; animation-duration: 16s; }
.particle:nth-child(28) { left: 56%; animation-delay: 2.4s; animation-duration: 12s; }
.particle:nth-child(29) { left: 58%; animation-delay: 3.4s; animation-duration: 15s; }
.particle:nth-child(30) { left: 60%; animation-delay: 4.4s; animation-duration: 13s; }
.particle:nth-child(31) { left: 62%; animation-delay: 0.6s; animation-duration: 17s; }
.particle:nth-child(32) { left: 64%; animation-delay: 1.6s; animation-duration: 14s; }
.particle:nth-child(33) { left: 66%; animation-delay: 2.6s; animation-duration: 16s; }
.particle:nth-child(34) { left: 68%; animation-delay: 3.6s; animation-duration: 12s; }
.particle:nth-child(35) { left: 70%; animation-delay: 4.6s; animation-duration: 15s; }
.particle:nth-child(36) { left: 72%; animation-delay: 0.1s; animation-duration: 13s; }
.particle:nth-child(37) { left: 74%; animation-delay: 1.1s; animation-duration: 17s; }
.particle:nth-child(38) { left: 76%; animation-delay: 2.1s; animation-duration: 14s; }
.particle:nth-child(39) { left: 78%; animation-delay: 3.1s; animation-duration: 16s; }
.particle:nth-child(40) { left: 80%; animation-delay: 4.1s; animation-duration: 12s; }
.particle:nth-child(41) { left: 82%; animation-delay: 0.8s; animation-duration: 15s; }
.particle:nth-child(42) { left: 84%; animation-delay: 1.8s; animation-duration: 13s; }
.particle:nth-child(43) { left: 86%; animation-delay: 2.8s; animation-duration: 17s; }
.particle:nth-child(44) { left: 88%; animation-delay: 3.8s; animation-duration: 14s; }
.particle:nth-child(45) { left: 90%; animation-delay: 4.8s; animation-duration: 16s; }
.particle:nth-child(46) { left: 92%; animation-delay: 0.9s; animation-duration: 12s; }
.particle:nth-child(47) { left: 94%; animation-delay: 1.9s; animation-duration: 15s; }
.particle:nth-child(48) { left: 96%; animation-delay: 2.9s; animation-duration: 13s; }
.particle:nth-child(49) { left: 98%; animation-delay: 3.9s; animation-duration: 17s; }
.particle:nth-child(50) { left: 100%; animation-delay: 4.9s; animation-duration: 14s; }

/* 内容区域 */
.content {
  position: relative;
  z-index: 1;
  padding: 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 标题区域 */
.header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 16px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fee140 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 5s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 4px;
}

/* 功能卡片网格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-card:hover .card-glow {
  opacity: 0.15;
  box-shadow: 0 0 60px 20px rgba(100, 150, 255, 0.5);
}

.card-content {
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.icon {
  font-size: 32px;
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.feature-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

/* 底部 */
.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .content {
    padding: 40px 20px;
  }

  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .feature-grid {
    gap: 20px;
  }
}
</style>
