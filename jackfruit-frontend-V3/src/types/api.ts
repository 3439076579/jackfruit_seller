/**
 * 后端统一响应包装。
 *
 * 注意：Gin 里所有接口都用 http.StatusOK 返回，错误码藏在 status_code 里
 * （0 = 成功，-1 = 失败）。因此 axios 的 reject 分支抓不到业务错误，
 * 必须在 request 层主动判断，见 src/utils/request.ts 的 unwrap()。
 */
export interface ApiResponse<T> {
  status_code: number
  data: T
  message: string
}
