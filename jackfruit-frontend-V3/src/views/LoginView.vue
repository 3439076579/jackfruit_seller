<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { register } from '@/api/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('login')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  confirm: '',
})

// 后端 user 表 username / password 都是 varchar(20)，顺手把约束前置到表单
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 20, message: '数据库字段限制 20 字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { max: 20, message: '数据库字段限制 20 字符', trigger: 'blur' },
  ],
  confirm: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (activeTab.value !== 'register') return callback()
        if (value !== form.password) return callback(new Error('两次输入不一致'))
        return callback()
      },
      trigger: 'blur',
    },
  ],
}

async function validate(): Promise<boolean> {
  if (!formRef.value) return false
  return formRef.value.validate().catch(() => false)
}

async function goNext() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect) {
    await router.replace(redirect)
    return
  }
  // 管理员进后台，普通会员进商城
  await router.replace(
    userStore.isAdmin ? { name: 'admin-dashboard' } : { name: 'shop-products' },
  )
}

async function handleSubmit() {
  if (!(await validate())) return
  submitting.value = true
  try {
    if (activeTab.value === 'register') {
      await register(form.username, form.password)
      await userStore.login(form.username, form.password)
      ElMessage.success('注册成功，已自动登录')
    } else {
      await userStore.login(form.username, form.password)
      ElMessage.success('登录成功')
    }
    await goNext()
  } catch {
    // 业务错误提示已由 request 层统一弹出，这里只负责恢复按钮状态
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="never">
      <h1 class="title">波罗蜜订购系统</h1>
      <p class="subtitle">Vue 3 + Vite + TypeScript 重构版</p>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登录" name="login" />
        <el-tab-pane label="注册" name="register" />
      </el-tabs>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model.trim="form.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item v-if="activeTab === 'register'" label="确认密码" prop="confirm">
          <el-input
            v-model="form.confirm"
            type="password"
            show-password
            placeholder="请再次输入密码"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-button type="primary" class="submit" :loading="submitting" @click="handleSubmit">
          {{ activeTab === 'login' ? '登 录' : '注 册' }}
        </el-button>
      </el-form>

      <p class="tip">接口直连 localhost:8082，请先启动 Go 服务</p>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #eef2f6;
}

.login-card {
  width: 380px;
  padding: 8px 12px 4px;
  border-radius: 12px;
}

.title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.subtitle {
  margin: 0 0 18px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.submit {
  width: 100%;
  margin-top: 6px;
}

.tip {
  margin: 16px 0 0;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
}
</style>
