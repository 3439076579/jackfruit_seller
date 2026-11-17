import { get, postForm, type FormValue } from '@/utils/request'
import { toCategory, toCategoryList } from '@/adapters/category'
import { toProduct, toProductList } from '@/adapters/product'
import type { Category, Product } from '@/types/models'
import type { RawCategory, RawProduct } from '@/types/raw'

export const fetchProducts = (): Promise<Product[]> =>
  get<RawProduct[]>('/jackfruit/list').then(toProductList)

export const fetchCategories = (): Promise<Category[]> =>
  get<RawCategory[]>('/jackfruit/categories').then(toCategoryList)

export interface ProductForm {
  name: string
  storage: number
  price: number
  categoryId: number
  managementInfo?: string
  feature?: string
  plantIntro?: string
  /** /jackfruit/add 在后端强制要求文件（FormFile 失败即返回错误），新增必须带图 */
  image?: File | null
}

function toFormFields(input: ProductForm): Record<string, FormValue> {
  return {
    name: input.name,
    storage: input.storage,
    price: input.price,
    category_id: input.categoryId,
    management_info: input.managementInfo,
    feature: input.feature,
    plant_intro: input.plantIntro,
    image: input.image,
  }
}

export const addProduct = (input: ProductForm): Promise<Product> =>
  postForm<RawProduct>('/jackfruit/add', toFormFields(input)).then(toProduct)

/**
 * 后端按 product_name 定位记录，name 必须与库中完全一致。
 * 另有两个"零值即跳过"的坑：
 *   storage = 0 或 price = 0 会被当成"不修改"，因此无法把库存/价格改成 0。
 */
export const updateProduct = (input: ProductForm): Promise<Product> =>
  postForm<RawProduct>('/jackfruit/update', toFormFields(input)).then(toProduct)

export const deleteProduct = (id: number): Promise<void> => get<void>('/jackfruit/delete', { id })

export const addCategory = (name: string): Promise<Category> =>
  postForm<RawCategory>('/jackfruit/category/add', { category_name: name }).then(toCategory)
