<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Goods, HomeFilled, List, Menu, User, UserFilled } from '@element-plus/icons-vue'
import { notifyApi } from '@/api'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useUserStore } from '@/stores/user'

/**
 * 路由表里只存图标名字符串（路由不该依赖组件实例），
 * 在这里做一次映射，顺带保证只有真正用到的图标进包。
 */
const iconMap: Record<string, Component> = {
  HomeFilled,
  Goods,
  User,
  List,
  DataAnalysis,
  Menu,
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/**
 * 侧边菜单直接从路由表推导，避免"新增页面忘了加菜单"这类不同步问题。
 * 后续把 PlaceholderView 换成真实页面时，菜单无需改动。
 */
const menuItems = computed(() => {
  const admin = router.options.routes.find((item) => item.path === '/admin')
  return (admin?.children ?? []).map((child) => ({
    path: `/admin/${child.path}`,
    title: child.meta?.title ?? String(child.path),
    icon: child.meta?.icon ?? 'Menu',
  }))
})

function handleLogout() {
  userStore.logout()
  router.replace({ name: 'login' })
}

/**
 * 双保险：路由守卫已经拦过一次，这里兜底「已进入后台后 store 被改写」的情况
 * （例如在控制台手动清掉 localStorage 再刷新）。仍然只是界面控制。
 */
onMounted(() => {
  if (!userStore.isAdmin) {
    ElMessage.error('无权访问后台')
    router.replace({ name: 'shop-products' })
  }
})

const notifyVisible = ref(false)
const notifyMessage = ref('')
const notifySubmitting = ref(false)

async function publishNotify() {
  const message = notifyMessage.value.trim()
  if (!message) {
    ElMessage.warning('请输入公告内容')
    return
  }
  notifySubmitting.value = true
  try {
    await notifyApi.publishNotify(message)
    ElMessage.success('公告已发布，商城首页会弹出提示')
    notifyVisible.value = false
    notifyMessage.value = ''
  } catch {
    // 错误提示由 request 层统一处理
  } finally {
    notifySubmitting.value = false
  }
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="admin-aside">
      <div class="brand">波罗蜜后台</div>
      <el-menu :default-active="route.path" router class="admin-menu">
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="iconMap[item.icon] ?? Menu" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header" height="56px">
        <AppBreadcrumb />
        <el-dropdown>
          <span class="user-entry">
            <el-icon><UserFilled /></el-icon>
            {{ userStore.username || '未登录' }}
            <el-tag size="small" type="warning" effect="plain">{{ userStore.roleLabel }}</el-tag>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="notifyVisible = true">发布公告</el-dropdown-item>
              <el-dropdown-item @click="router.push('/shop/products')">返回商城</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="notifyVisible" title="发布公告" width="440px">
    <el-input
      v-model="notifyMessage"
      type="textarea"
      :rows="3"
      maxlength="120"
      show-word-limit
      placeholder="发布后，商城首页会以通知形式弹出最新一条公告"
    />
    <template #footer>
      <el-button @click="notifyVisible = false">取消</el-button>
      <el-button type="primary" :loading="notifySubmitting" @click="publishNotify">发布</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.admin-layout {
  height: 100%;
}

.admin-aside {
  background-color: #304156;
}

.brand {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-size: 15px;
  color: #fff;
  letter-spacing: 1px;
}

.admin-menu {
  border-right: none;
  background-color: #304156;
  --el-menu-bg-color: #304156;
  --el-menu-text-color: #bfcbd9;
  --el-menu-hover-bg-color: #263445;
  --el-menu-active-color: #409eff;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  outline: none;
}

.admin-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>
