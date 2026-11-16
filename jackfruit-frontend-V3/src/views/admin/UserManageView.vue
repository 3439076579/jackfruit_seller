<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/api'
import type { User } from '@/types/models'

const users = ref<User[]>([])
const keyword = ref('')
const loading = ref(false)
const submitting = ref(false)

const dialogVisible = ref(false)
const editing = ref<User | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
})

const isEdit = computed(() => editing.value !== null)

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 20, message: '数据库字段限制 20 字符', trigger: 'blur' },
  ],
  password: [{ max: 20, message: '数据库字段限制 20 字符', trigger: 'blur' }],
}

const filtered = computed(() => {
  const query = keyword.value.trim()
  if (!query) return users.value
  return users.value.filter((item) => item.username.includes(query))
})

async function load() {
  loading.value = true
  try {
    users.value = await userApi.fetchAllUsers()
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.username = ''
  form.password = ''
  form.phone = ''
  form.email = ''
  dialogVisible.value = true
}

function openEdit(row: User) {
  editing.value = row
  form.username = row.username
  form.password = ''
  form.phone = row.phone
  form.email = row.email
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editing.value) {
      // 后端 update_id 只写 password / phone / email，username 是定位键、改不了
      await userApi.updateUserById(editing.value.id, {
        password: form.password || undefined,
        phone: form.phone,
        email: form.email,
      })
      ElMessage.success('已保存')
    } else {
      await userApi.addUser({
        username: form.username,
        password: form.password,
        phone: form.phone,
        email: form.email,
      })
      ElMessage.success('已添加')
    }
    dialogVisible.value = false
    await load()
  } catch {
    // 用户名重复等错误由 request 层提示
  } finally {
    submitting.value = false
  }
}

async function remove(row: User) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.username}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await userApi.deleteUser(row.id)
    ElMessage.success('已删除')
    await load()
  } catch {
    // 忽略
  }
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="按用户名搜索" clearable style="width: 240px" />
      <el-button type="primary" @click="openCreate">新增会员</el-button>
    </div>

    <el-table v-loading="loading" :data="filtered" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column label="手机号" width="150">
        <template #default="{ row }">
          <span :class="{ muted: !row.phone }">{{ row.phone || '未填写' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="180">
        <template #default="{ row }">
          <span :class="{ muted: !row.email }">{{ row.email || '未填写' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="120">
        <template #default="{ row }">{{ row.createdAt.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '新增会员'" width="440px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" :disabled="isEdit" placeholder="登录账号" />
          <p v-if="isEdit" class="tip">用户名是定位键，后端不支持修改</p>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? '留空表示不修改' : '登录密码'"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model.trim="form.phone" maxlength="17" placeholder="选填" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model.trim="form.email" maxlength="25" placeholder="选填" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.muted {
  color: #c0c4cc;
  font-size: 12px;
}

.tip {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #c0c4cc;
}
</style>
