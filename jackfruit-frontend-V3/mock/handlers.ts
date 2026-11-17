/**
 * Mock 接口实现。
 *
 * 原则：尽量复刻后端的真实行为，包括它的怪癖 —— 这样前端在 mock 下能跑通，
 * 切到真后端也不会突然坏掉。刻意保留的三处：
 *   1. 登录/注册/用户相关接口全部从 query 取参（后端用 c.Query）
 *   2. 订单返回的 user 字段是全零对象（后端 order 只 Preload 了 Jackfruit）
 *   3. 商品更新时 storage / price 为 0 视作"不修改"
 */
import type { RawNotify, RawOrder, RawProduct, RawReview, RawUser } from '../src/types/raw'
import {
  categories,
  nextId,
  notifies,
  orders,
  products,
  reviews,
  users,
  zeroProduct,
  zeroUser,
  type OrderRecord,
} from './data'

export interface MockRequest {
  method: string
  path: string
  query: Record<string, string>
  body: Record<string, string>
  files: Record<string, { filename: string; size: number }>
}

export interface MockResult {
  status_code: number
  message: string
  data: unknown
}

const ok = (data: unknown = null): MockResult => ({ status_code: 0, message: 'success', data })
const fail = (message: string): MockResult => ({ status_code: -1, message, data: null })

const str = (value: string | undefined): string => value ?? ''
const num = (value: string | undefined): number => {
  const parsed = Number(value ?? '')
  return Number.isFinite(parsed) ? parsed : 0
}

function stamp(id: number): Pick<RawUser, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'> {
  const now = new Date().toISOString()
  return { ID: id, CreatedAt: now, UpdatedAt: now, DeletedAt: null }
}

const withCategory = (product: RawProduct): RawProduct => ({
  ...product,
  category: categories.find((item) => item.ID === product.category_id) ?? null,
})

const withUser = (review: RawReview): RawReview => ({
  ...review,
  user: users.find((item) => item.ID === review.user_id) ?? null,
})

/** 复刻后端：order 只 Preload 了 Jackfruit，user 是值类型零值对象 */
function toRawOrder(record: OrderRecord): RawOrder {
  const product = products.find((item) => item.ID === record.jackfruit_id)
  return {
    ID: record.ID,
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt,
    DeletedAt: record.DeletedAt,
    user: zeroUser,
    address: record.address,
    total: record.total,
    quantity: record.quantity,
    jackfruit: product ? withCategory(product) : zeroProduct,
  }
}

/* ------------------------------ 用户 ------------------------------ */

function login(req: MockRequest): MockResult {
  const user = users.find((item) => item.username === str(req.query.username))
  if (!user) return fail('record not found')
  if (user.password !== str(req.query.password)) return fail('incorrect password')
  return ok(user)
}

function register(req: MockRequest): MockResult {
  const username = str(req.query.username)
  if (!username) return fail('username cannot be empty')
  if (users.some((item) => item.username === username)) return fail('username has been registered')
  const user: RawUser = {
    ...stamp(nextId()),
    username,
    password: str(req.query.password),
    phone: str(req.query.phone),
    email: str(req.query.email),
  }
  users.push(user)
  return ok(user)
}

function updateUserByName(req: MockRequest): MockResult {
  const user = users.find((item) => item.username === str(req.query.username))
  if (!user) return fail('record not found')
  applyUserPatch(user, req)
  return ok(user)
}

function updateUserById(req: MockRequest): MockResult {
  const user = users.find((item) => item.ID === num(req.query.id))
  if (!user) return fail('record not found')
  applyUserPatch(user, req)
  return ok(user)
}

/** 后端只写 password / phone / email 三个字段，username 是定位键、不可改 */
function applyUserPatch(user: RawUser, req: MockRequest): void {
  const password = str(req.query.password)
  if (password) user.password = password
  const phone = str(req.query.phone)
  if (phone) user.phone = phone
  const email = str(req.query.email)
  if (email) user.email = email
  user.UpdatedAt = new Date().toISOString()
}

function getUser(req: MockRequest): MockResult {
  const user = users.find((item) => item.username === str(req.query.username))
  return user ? ok(user) : fail('record not found')
}

function deleteUser(req: MockRequest): MockResult {
  const id = num(req.query.id)
  const index = users.findIndex((item) => item.ID === id)
  if (index >= 0) users.splice(index, 1)
  return ok(null)
}

/* ------------------------------ 商品 ------------------------------ */

function listProducts(): MockResult {
  return ok(products.map(withCategory))
}

function addProduct(req: MockRequest): MockResult {
  const name = str(req.body.name)
  if (!name) return fail('商品名不能为空')
  const product: RawProduct = {
    ...stamp(nextId()),
    category_id: num(req.body.category_id),
    name,
    storage: num(req.body.storage),
    price: num(req.body.price),
    // mock 不把上传文件落盘，用现有图片顶上
    image: req.files.image ? '/mock/jackfruit3.png' : '/mock/jackfruit2.png',
    management_info: str(req.body.management_info),
    feature: str(req.body.feature),
    plant_intro: str(req.body.plant_intro),
  }
  products.push(product)
  return ok(withCategory(product))
}

function updateProduct(req: MockRequest): MockResult {
  const product = products.find((item) => item.name === str(req.body.name))
  if (!product) return fail('record not found')

  const storage = num(req.body.storage)
  if (storage !== 0) product.storage = storage
  const price = num(req.body.price)
  if (price !== 0) product.price = price
  const managementInfo = str(req.body.management_info)
  if (managementInfo) product.management_info = managementInfo
  const feature = str(req.body.feature)
  if (feature) product.feature = feature
  const plantIntro = str(req.body.plant_intro)
  if (plantIntro) product.plant_intro = plantIntro
  product.category_id = num(req.body.category_id)
  if (req.files.image) product.image = '/mock/jackfruit4.png'
  product.UpdatedAt = new Date().toISOString()

  return ok(withCategory(product))
}

function deleteProduct(req: MockRequest): MockResult {
  const id = num(req.query.id)
  const index = products.findIndex((item) => item.ID === id)
  if (index >= 0) products.splice(index, 1)
  return ok(null)
}

function addCategory(req: MockRequest): MockResult {
  const name = str(req.body.category_name)
  if (!name) return fail('分类名不能为空')
  if (categories.some((item) => item.category_name === name)) return fail('Duplicate entry')
  const created = { ...stamp(nextId()), category_name: name }
  categories.push(created)
  return ok(created)
}

/* ------------------------------ 订单 ------------------------------ */

function createOrder(req: MockRequest): MockResult {
  const productId = num(req.body.jackfruit_id)
  const quantity = num(req.body.quantity)
  const product = products.find((item) => item.ID === productId)
  if (!product) return fail('商品不存在')
  if (quantity > product.storage) return fail('超出库存')

  product.storage -= quantity
  const record: OrderRecord = {
    ...stamp(nextId()),
    order_user_id: num(req.body.user_id),
    jackfruit_id: productId,
    address: str(req.body.address),
    total: num(req.body.total),
    quantity,
  }
  orders.push(record)
  return ok(toRawOrder(record))
}

function listOrders(): MockResult {
  return ok(orders.map(toRawOrder))
}

function personalOrders(req: MockRequest): MockResult {
  const userId = num(req.query.user_id)
  return ok(orders.filter((item) => item.order_user_id === userId).map(toRawOrder))
}

/* ------------------------------ 公告 ------------------------------ */

function addNotify(req: MockRequest): MockResult {
  const notify: RawNotify = { ...stamp(nextId()), Message: str(req.body.message) }
  notifies.push(notify)
  return ok(notify)
}

function lastNotify(): MockResult {
  const notify = notifies.at(-1)
  return notify ? ok(notify) : fail('record not found')
}

/* ------------------------------ 统计 ------------------------------ */

function salesRanking(): MockResult {
  const grouped = new Map<number, { sales: number; revenue: number }>()
  for (const order of orders) {
    const current = grouped.get(order.jackfruit_id) ?? { sales: 0, revenue: 0 }
    current.sales += order.quantity
    current.revenue += order.total
    grouped.set(order.jackfruit_id, current)
  }
  const ranking = [...grouped.entries()]
    .map(([id, value]) => ({
      jackfruit_id: id,
      product_name: products.find((item) => item.ID === id)?.name ?? '',
      total_sales: value.sales,
      total_revenue: value.revenue,
    }))
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10)
  return ok(ranking)
}

function categoryRevenue(): MockResult {
  const grouped = new Map<string, { revenue: number; count: number }>()
  for (const order of orders) {
    const product = products.find((item) => item.ID === order.jackfruit_id)
    if (!product) continue
    const category = categories.find((item) => item.ID === product.category_id)
    const name = category?.category_name ?? '未分类'
    const current = grouped.get(name) ?? { revenue: 0, count: 0 }
    current.revenue += order.total
    current.count += 1
    grouped.set(name, current)
  }
  const rows = [...grouped.entries()]
    .map(([name, value]) => ({
      category_name: name,
      total_revenue: value.revenue,
      order_count: value.count,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
  return ok(rows)
}

function highRating(req: MockRequest): MockResult {
  const minRating = req.query.min_rating ? num(req.query.min_rating) : 4
  const grouped = new Map<number, { sum: number; count: number }>()
  for (const review of reviews) {
    const current = grouped.get(review.jackfruit_id) ?? { sum: 0, count: 0 }
    current.sum += review.rating
    current.count += 1
    grouped.set(review.jackfruit_id, current)
  }
  const rows = [...grouped.entries()]
    .map(([id, value]) => ({
      product_id: id,
      product_name: products.find((item) => item.ID === id)?.name ?? '',
      avg_rating: Number((value.sum / value.count).toFixed(4)),
      review_count: value.count,
    }))
    .filter((row) => row.avg_rating >= minRating)
    .sort((a, b) => b.avg_rating - a.avg_rating)
  return ok(rows)
}

/* ------------------------------ 评价 ------------------------------ */

function listReviews(req: MockRequest): MockResult {
  const productId = num(req.query.jackfruit_id)
  return ok(
    reviews
      .filter((item) => item.jackfruit_id === productId)
      .sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt))
      .map(withUser),
  )
}

function addReview(req: MockRequest): MockResult {
  const rating = num(req.body.rating)
  if (rating < 1 || rating > 5) return fail('评分必须在1到5之间')

  const productId = num(req.body.jackfruit_id)
  if (!products.some((item) => item.ID === productId)) return fail('商品不存在')

  const userId = num(req.body.user_id)
  if (reviews.some((item) => item.user_id === userId && item.jackfruit_id === productId)) {
    return fail('该用户已评价过此商品')
  }

  const review: RawReview = {
    ...stamp(nextId()),
    user_id: userId,
    jackfruit_id: productId,
    rating,
    content: str(req.body.content),
  }
  reviews.push(review)
  return ok(withUser(review))
}

/* ------------------------------ 路由表 ------------------------------ */

const routes: Record<string, (req: MockRequest) => MockResult> = {
  'POST /user/login': login,
  'POST /user/register': register,
  'POST /user/update_user': updateUserByName,
  'POST /user/update_id': updateUserById,
  'POST /user/add': register,
  'GET /user/user': getUser,
  'GET /user/user_list': () => ok(users),
  'GET /user/delete': deleteUser,
  'POST /user/delete': deleteUser,

  'GET /jackfruit/list': listProducts,
  'POST /jackfruit/add': addProduct,
  'POST /jackfruit/update': updateProduct,
  'GET /jackfruit/delete': deleteProduct,
  'GET /jackfruit/categories': () => ok(categories),
  'POST /jackfruit/category/add': addCategory,

  'POST /order/create': createOrder,
  'GET /order/order_list': listOrders,
  'GET /order/personal': personalOrders,

  'POST /notify/add': addNotify,
  'GET /notify/last': lastNotify,

  'GET /analytics/sales_ranking': salesRanking,
  'GET /analytics/category_revenue': categoryRevenue,
  'GET /analytics/high_rating': highRating,

  'GET /review/list': listReviews,
  'POST /review/add': addReview,
}

export function resolve(req: MockRequest): MockResult {
  const key = `${req.method.toUpperCase()} ${req.path}`
  const handler = routes[key]
  if (!handler) return fail(`mock 未覆盖该接口：${key}`)
  try {
    return handler(req)
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error))
  }
}
