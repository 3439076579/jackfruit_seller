import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/user'
import { isAdminUser } from '@/config/permissions'
import type { User } from '@/types/models'

const STORAGE_KEY = 'jackfruit:currentUser'

function restore(): User | null {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (!cached) return null
  try {
    return JSON.parse(cached) as User
  } catch {
    // 缓存损坏就当未登录，不要让脏数据卡住启动
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(restore())

  const isLoggedIn = computed(() => currentUser.value !== null)
  const userId = computed(() => currentUser.value?.id ?? 0)
  const username = computed(() => currentUser.value?.username ?? '')
  /** 角色来自前端约定，后端无 role 字段，详见 src/config/permissions.ts */
  const isAdmin = computed(() => isAdminUser(currentUser.value?.username))
  const roleLabel = computed(() => (isAdmin.value ? '管理员' : '普通会员'))

  function setUser(user: User | null) {
    currentUser.value = user
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * 后端没有 token 机制，登录成功后只返回用户对象。
   * 沿用旧前端的做法：把用户信息落 localStorage，刷新后由 restore() 恢复。
   */
  async function login(name: string, password: string) {
    const user = await loginApi(name, password)
    setUser(user)
    return user
  }

  function logout() {
    setUser(null)
  }

  return {
    currentUser,
    isLoggedIn,
    userId,
    username,
    isAdmin,
    roleLabel,
    login,
    logout,
    setUser,
  }
})
