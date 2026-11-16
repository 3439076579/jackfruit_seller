import axios, { type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

/**
 * 后端接口只认三种参数位置，没有一个是 JSON body。
 * 所以这里直接把三种形态固化成三个函数，调用时选错就编译不过：
 *
 *   get<T>         GET，参数拼 query            （/jackfruit/list、/analytics/*）
 *   postQuery<T>   POST，参数仍是 query          （/user/login、/user/register 等）
 *   postForm<T>    POST，multipart 表单          （/jackfruit/add、/order/create 等）
 *
 * 最容易踩的坑：后端 /user/* 全部用 c.Query，写 post(url, {username}) 会把参数塞进 body，
 * 后端读到空字符串后返回 "record not found" —— 不报错，只静默失败。
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
})

function describeHttpError(err: AxiosError): string {
  if (err.code === 'ECONNABORTED') return '请求超时，请检查后端是否响应'
  if (err.response) return `服务端返回 ${err.response.status}`
  return '无法连接后端，请确认 localhost:8082 已启动'
}

// 只处理 HTTP 层异常（网络中断、4xx/5xx）。
// 业务错误（status_code = -1）由 unwrap 处理，两者不要重复提示。
http.interceptors.response.use(
  (response) => response,
  (err: AxiosError) => {
    ElMessage.error(describeHttpError(err))
    return Promise.reject(err)
  },
)

export interface RequestOptions {
  /**
   * 静默模式：不弹错误提示，由调用方自行处理。
   * 用于"暂无公告""未登录过"这类后端会返回 -1 的正常空态。
   */
  silent?: boolean
}

/**
 * 拆开 { status_code, data, message }。
 * 后端错误也是 HTTP 200，所以必须在成功回调里主动抛。
 */
function unwrap<T>(body: ApiResponse<T>, silent: boolean): T {
  if (body.status_code !== 0) {
    const message = body.message || '请求失败'
    if (!silent) ElMessage.error(message)
    throw new Error(message)
  }
  return body.data
}

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  options: RequestOptions = {},
): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, { params })
  return unwrap(res.data, options.silent ?? false)
}

export async function postQuery<T>(
  url: string,
  params?: Record<string, unknown>,
  options: RequestOptions = {},
): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, null, { params })
  return unwrap(res.data, options.silent ?? false)
}

export type FormValue = string | number | Blob | null | undefined

export async function postForm<T>(
  url: string,
  fields: Record<string, FormValue>,
  options: RequestOptions = {},
): Promise<T> {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue
    form.append(key, value instanceof Blob ? value : String(value))
  }
  // 不要手写 Content-Type，交给浏览器带上 boundary
  const res = await http.post<ApiResponse<T>>(url, form)
  return unwrap(res.data, options.silent ?? false)
}

export default http
