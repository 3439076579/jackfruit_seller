import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/shop/products' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, title: '登录' },
    },
    {
      path: '/shop',
      component: () => import('@/layouts/ShopLayout.vue'),
      redirect: '/shop/products',
      children: [
        {
          path: 'products',
          name: 'shop-products',
          component: () => import('@/views/shop/ProductListView.vue'),
          meta: { title: '每日推荐' },
        },
        {
          path: 'orders',
          name: 'shop-orders',
          component: () => import('@/views/shop/OrderListView.vue'),
          meta: { title: '我的订单' },
        },
        {
          path: 'profile',
          name: 'shop-profile',
          component: () => import('@/views/shop/ProfileView.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      // 父级声明即可：to.meta 会把匹配链上的 meta 合并，子路由自动继承
      meta: { requiresAdmin: true, title: '后台' },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
          meta: { title: '首页', icon: 'HomeFilled' },
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/admin/ProductManageView.vue'),
          meta: { title: '波罗蜜管理', icon: 'Goods' },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManageView.vue'),
          meta: { title: '会员管理', icon: 'User' },
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/OrderManageView.vue'),
          meta: { title: '订单管理', icon: 'List' },
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          component: () => import('@/views/admin/AnalyticsView.vue'),
          meta: { title: '统计分析', icon: 'DataAnalysis' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { public: true, title: '页面不存在' },
    },
  ],
})

/**
 * 三道边界，按顺序判：
 *   1. 未登录访问非公开页 → 去登录页，并记住原地址
 *   2. 已登录还去登录页   → 按角色回各自首页
 *   3. 非管理员访问后台   → 拦回商城
 *
 * 注意第 3 条只是界面控制，不是安全边界：
 * 后端没有鉴权中间件，直接调接口照样能改数据。细节见 src/config/permissions.ts。
 */
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (!to.meta.public && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && userStore.isLoggedIn) {
    return userStore.isAdmin ? { name: 'admin-dashboard' } : { name: 'shop-products' }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    ElMessage.warning('该页面需要管理员权限，已返回商城')
    return { name: 'shop-products' }
  }

  return true
})

export default router
