<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi, userApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const profile = reactive({
  phone: '',
  email: '',
  password: '',
})

const submitting = ref(false)
const orderCount = ref(0)
const totalSpent = ref(0)

const current = computed(() => userStore.currentUser)

const initials = computed(() => (userStore.username || '?').slice(0, 1).toUpperCase())

function syncForm() {
  profile.phone = current.value?.phone ?? ''
  profile.email = current.value?.email ?? ''
  profile.password = ''
}

async function loadStats() {
  if (!userStore.userId) return
  try {
    const orders = await orderApi.fetchMyOrders(userStore.userId)
    orderCount.value = orders.length
    totalSpent.value = orders.reduce((sum, order) => sum + order.total, 0)
  } catch {
    orderCount.value = 0
    totalSpent.value = 0
  }
}

async function save() {
  if (!userStore.userId) return
  submitting.value = true
  try {
    const updated = await userApi.updateUserById(userStore.userId, {
      phone: profile.phone,
      email: profile.email,
      // 留空表示不修改，后端会跳过空值
      password: profile.password || undefined,
    })
    userStore.setUser(updated)
    profile.password = ''
    ElMessage.success('资料已更新')
  } catch {
    // 错误提示由 request 层统一处理
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  syncForm()
  loadStats()
})
</script>

<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="8">
      <el-card shadow="never" class="profile-card">
        <div class="avatar-block">
          <el-avatar :size="64" class="avatar">{{ initials }}</el-avatar>
          <p class="username">{{ userStore.username }}</p>
          <p class="joined">注册于 {{ current?.createdAt?.slice(0, 10) ?? '—' }}</p>
        </div>

        <el-divider />

        <div class="stats">
          <div class="stat">
            <span class="value">{{ orderCount }}</span>
            <span class="label">订单数</span>
          </div>
          <div class="stat">
            <span class="value">¥{{ totalSpent.toFixed(2) }}</span>
            <span class="label">累计消费</span>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :xs="24" :md="16">
      <el-card shadow="never">
        <template #header><span class="card-title">修改资料</span></template>

        <el-form label-width="80px" style="max-width: 420px" @submit.prevent>
          <el-form-item label="用户名">
            <el-input :model-value="userStore.username" disabled />
            <p class="tip">用户名是后端定位用户的键，不支持修改</p>
          </el-form-item>

          <el-form-item label="手机号">
            <el-input v-model.trim="profile.phone" maxlength="17" placeholder="选填" />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model.trim="profile.email" maxlength="25" placeholder="选填" />
          </el-form-item>

          <el-form-item label="新密码">
            <el-input
              v-model="profile.password"
              type="password"
              show-password
              maxlength="20"
              placeholder="留空表示不修改"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="save">保存修改</el-button>
            <el-button @click="syncForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.profile-card {
  margin-bottom: 16px;
}

.avatar-block {
  text-align: center;
}

.avatar {
  background-color: #409eff;
  font-size: 24px;
}

.username {
  margin: 10px 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.joined {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.stats {
  display: flex;
  text-align: center;
}

.stat {
  flex: 1;
}

.stat .value {
  display: block;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.stat .label {
  font-size: 12px;
  color: #909399;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.tip {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #c0c4cc;
}
</style>
