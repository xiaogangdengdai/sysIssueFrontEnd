import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '氧屋AI助手' }
  },
  {
    path: '/dev-assistant',
    name: 'DevAssistant',
    component: () => import('@/components/IssueLog.vue'),
    meta: { title: '开发助手' }
  },
  {
    path: '/html-fast-implement',
    name: 'HtmlFastImplement',
    component: () => import('@/components/HtmlFastImplement.vue'),
    meta: { title: '页面原型快速实现' }
  },
  {
    path: '/java-analysis',
    name: 'JavaAnalysis',
    component: () => import('@/components/ImportJavaAnalysis.vue'),
    meta: { title: '后台类分析' }
  },
  {
    path: '/vue-analysis',
    name: 'VueAnalysis',
    component: () => import('@/components/ImportVueAnalysis.vue'),
    meta: { title: '前端功能模块分析' }
  },
  {
    path: '/code-review',
    name: 'CodeReview',
    component: () => import('@/components/CodeReview.vue'),
    meta: { title: '代码Review报告' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '氧屋AI助手'
  next()
})

export default router
