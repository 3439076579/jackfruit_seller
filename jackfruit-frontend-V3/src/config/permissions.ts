/**
 * 权限约定 —— 全项目唯一需要改的地方。
 *
 * 背景：后端 user 表只有 username / password / phone / email，
 * 没有 role 或 is_admin 字段，登录接口也不返回任何权限信息。
 * 所以「谁是管理员」这件事，后端根本不知道，只能在前端约定。
 *
 * ⚠️ 这**不是安全边界**：
 *    后端所有接口都没有鉴权中间件，任何人拿到 URL 就能直接调用
 *    （例如 curl -X POST 'localhost:8082/user/delete?id=1'）。
 *    这里的判断只决定「界面上出现哪些入口」，用来做角色区分和演示，
 *    不能当作权限系统。真正的权限必须落在后端。
 *
 * 如果将来后端补了字段（约 3 行改动）：
 *   1. UserModel 加  IsAdmin bool `json:"is_admin"`
 *   2. 登录成功后前端从 User 对象读到 isAdmin
 *   3. 把本文件删掉，isAdmin 改为读接口字段即可
 */
export const ADMIN_USERNAMES = ['admin']

export function isAdminUser(username?: string | null): boolean {
  if (!username) return false
  return ADMIN_USERNAMES.includes(username)
}
