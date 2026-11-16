<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { ArrowDown, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { notifyApi } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

onMounted(async () => {
  // 公告是可选功能，空表时后端返回 -1，已在 api 层静默处理
  const notify = await notifyApi.fetchLastNotify()
  if (notify?.message) {
    ElNotification({
      title: '系统公告',
      message: notify.message,
      duration: 6000,
      position: 'bottom-right',
    })
  }
})

function handleCommand(command: unknown) {
  if (command === 'logout') {
    userStore.logout()
    router.replace({ name: 'login' })
  } else if (command === 'profile') {
    router.push({ name: 'shop-profile' })
  } else if (command === 'admin') {
    router.push({ name: 'admin-dashboard' })
  }
}
</script>

<template>
  <el-container class="shop-layout">
    <el-header class="shop-header" height="56px">
      <div class="brand">波罗蜜商城</div>

      <el-menu :default-active="route.path" mode="horizontal" router class="nav">
        <el-menu-item index="/shop/products">每日推荐</el-menu-item>
        <el-menu-item index="/shop/orders">我的订单</el-menu-item>
        <el-menu-item index="/shop/profile">个人中心</el-menu-item>
        <el-menu-item v-if="userStore.isAdmin" index="/admin/dashboard">后台管理</el-menu-item>
      </el-menu>

      <el-dropdown @command="handleCommand">
        <span class="user-entry">
          <el-icon><UserFilled /></el-icon>
          {{ userStore.username || '未登录' }}
          <el-tag
            v-if="userStore.isLoggedIn"
            size="small"
            effect="plain"
            :type="userStore.isAdmin ? 'warning' : 'info'"
          >
            {{ userStore.roleLabel }}
          </el-tag>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item v-if="userStore.isAdmin" command="admin">进入后台</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-main class="shop-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.shop-layout {
  height: 100%;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;
}

.brand {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
}

.nav {
  flex: 1;
  border-bottom: none;
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

.shop-main {
  padding: 20px 24px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
