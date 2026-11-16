import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 无需登录即可访问 */
    public?: boolean
    /** 需要管理员身份，非管理员访问会被守卫拦回商城 */
    requiresAdmin?: boolean
    /** 面包屑与页面标题 */
    title?: string
    /** 侧边菜单图标（Element Plus 图标组件名） */
    icon?: string
  }
}
