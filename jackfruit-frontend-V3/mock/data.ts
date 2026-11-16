/**
 * Mock 种子数据。
 *
 * 关键原则：这里存的是**后端 raw 契约**（ID / CreatedAt 大写、category_name 下划线），
 * 不是前端模型。理由：
 *   1. 类型上直接复用 src/types/raw.ts，mock 形状一旦与后端契约偏离就编译不过
 *   2. adapters 层会被真实走一遍，将来切回真后端零改动
 * 如果这里图省事直接吐前端模型，adapters 就永远没被验证过。
 */
import type { RawCategory, RawNotify, RawProduct, RawReview, RawUser } from '../src/types/raw'

type Meta = Pick<RawUser, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>

function meta(id: number, day: string): Meta {
  return {
    ID: id,
    CreatedAt: `${day}T09:00:00Z`,
    UpdatedAt: `${day}T09:00:00Z`,
    DeletedAt: null,
  }
}

let seq = 100
export function nextId(): number {
  seq += 1
  return seq
}

export const users: RawUser[] = [
  {
    ...meta(1, '2026-09-01'),
    username: 'admin',
    password: '123456',
    phone: '13800000001',
    email: 'admin@example.com',
  },
  {
    ...meta(2, '2026-09-03'),
    username: 'omnis',
    password: '123456',
    phone: '13900000002',
    email: 'omnis@example.com',
  },
  {
    // 普通会员：手机号和邮箱故意留空，用来验证页面上的「未填写」展示
    ...meta(3, '2026-10-20'),
    username: 'user01',
    password: '123456',
    phone: '',
    email: '',
  },
]

export const categories: RawCategory[] = [
  { ...meta(1, '2026-08-20'), category_name: '特级果' },
  { ...meta(2, '2026-08-20'), category_name: '一级果' },
  { ...meta(3, '2026-08-21'), category_name: '果肉制品' },
]

export const products: RawProduct[] = [
  {
    ...meta(1, '2026-09-05'),
    category_id: 1,
    name: '特级红肉波罗蜜',
    storage: 30,
    price: 158,
    image: '/mock/jackfruit1.png',
    management_info: '恒温 12℃ 存放，避免挤压，建议 3 天内食用',
    feature: '果肉橙红、干包少汁、香气浓郁，单果 8-10 斤',
    plant_intro: '海南万宁产区，树龄 8 年以上老树，自然成熟后采摘',
  },
  {
    ...meta(2, '2026-09-06'),
    category_id: 2,
    name: '一级红肉波罗蜜',
    storage: 45,
    price: 128,
    image: '/mock/jackfruit2.png',
    management_info: '常温阴凉处存放，切开后需冷藏',
    feature: '果肉饱满、甜度适中，单果 6-8 斤',
    plant_intro: '广东湛江产区，施用有机肥，无催熟剂',
  },
  {
    ...meta(3, '2026-09-08'),
    category_id: 1,
    name: '特级黄肉波罗蜜',
    storage: 22,
    price: 138,
    image: '/mock/jackfruit3.png',
    management_info: '避免阳光直射，成熟后可冷藏 5 天',
    feature: '果肉金黄、纤维细腻、清甜不腻，单果 7-9 斤',
    plant_intro: '云南西双版纳产区，海拔 600 米山地种植',
  },
  {
    ...meta(4, '2026-09-10'),
    category_id: 2,
    name: '珍珠波罗蜜小果',
    storage: 60,
    price: 88,
    image: '/mock/jackfruit4.png',
    management_info: '常温存放即可，小果成熟快，尽快食用',
    feature: '单果 3-4 斤，果苞小而密，适合一人食',
    plant_intro: '广西钦州产区，早熟品种',
  },
  {
    ...meta(5, '2026-09-12'),
    category_id: 3,
    name: '波罗蜜果肉真空装 500g',
    storage: 120,
    price: 45,
    image: '/mock/product-extra.jpg',
    management_info: '冷冻 -18℃ 保存，解冻后 24 小时内食用',
    feature: '去核果肉真空锁鲜，开袋即食',
    plant_intro: '由上述产区鲜果当日剥取，冷链直发',
  },
]

/** 订单表只存外键，返回时再按后端 Preload 的行为组装 */
export interface OrderRecord extends Meta {
  order_user_id: number
  jackfruit_id: number
  address: string
  total: number
  quantity: number
}

export const orders: OrderRecord[] = [
  {
    ...meta(1, '2026-10-02'),
    order_user_id: 1,
    jackfruit_id: 2,
    address: '广东省东莞市松山湖大学路 1 号',
    total: 256,
    quantity: 2,
  },
  {
    ...meta(2, '2026-10-05'),
    order_user_id: 2,
    jackfruit_id: 5,
    address: '广东省广州市天河区体育西路 100 号',
    total: 135,
    quantity: 3,
  },
  {
    ...meta(3, '2026-10-22'),
    order_user_id: 3,
    jackfruit_id: 3,
    address: '广东省深圳市南山区科技园南路 8 号',
    total: 138,
    quantity: 1,
  },
]

export const reviews: RawReview[] = [
  {
    ...meta(1, '2026-10-06'),
    user_id: 1,
    jackfruit_id: 1,
    rating: 5,
    content: '果肉厚实，甜度刚好，家里人都说好吃，回购了。',
  },
  {
    ...meta(2, '2026-10-08'),
    user_id: 2,
    jackfruit_id: 1,
    rating: 4,
    content: '物流很快，果子有一点点磕碰，不影响口感。',
  },
  {
    ...meta(3, '2026-10-09'),
    user_id: 2,
    jackfruit_id: 2,
    rating: 5,
    content: '性价比很高，剥出来的果苞比想象中多。',
  },
]

export const notifies: RawNotify[] = [
  {
    ...meta(1, '2026-11-10'),
    Message: '本周新到一批特级红肉波罗蜜，产地直发，欢迎选购。',
  },
]

/** 后端 user / order 关联字段是值类型，未 Preload 时返回全零对象而非 null */
export const zeroUser: RawUser = {
  ID: 0,
  CreatedAt: '0001-01-01T00:00:00Z',
  UpdatedAt: '0001-01-01T00:00:00Z',
  DeletedAt: null,
  username: '',
  password: '',
  phone: '',
  email: '',
}

export const zeroProduct: RawProduct = {
  ID: 0,
  CreatedAt: '0001-01-01T00:00:00Z',
  UpdatedAt: '0001-01-01T00:00:00Z',
  DeletedAt: null,
  category_id: 0,
  name: '',
  storage: 0,
  price: 0,
  image: '',
  management_info: '',
  feature: '',
  plant_intro: '',
  category: null,
}
