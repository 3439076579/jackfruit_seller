import { get, postQuery } from '@/utils/request'
import { toUser, toUserList } from '@/adapters/user'
import type { User } from '@/types/models'
import type { RawUser } from '@/types/raw'

/**
 * 后端 /user/* 全部用 c.Query 取参（包括 POST），
 * 所以一律走 postQuery，不要写成 postQuery('/user/login', body)。
 */
export const login = (username: string, password: string): Promise<User> =>
  postQuery<RawUser>('/user/login', { username, password }).then(toUser)

export const register = (username: string, password: string): Promise<User> =>
  postQuery<RawUser>('/user/register', { username, password }).then(toUser)

export const fetchUserByName = (username: string): Promise<User> =>
  get<RawUser>('/user/user', { username }).then(toUser)

export const fetchAllUsers = (): Promise<User[]> =>
  get<RawUser[]>('/user/user_list').then(toUserList)

export interface UserPayload {
  username: string
  password?: string
  phone?: string
  email?: string
}

export const addUser = (payload: UserPayload): Promise<User> =>
  postQuery<RawUser>('/user/add', { ...payload }).then(toUser)

/**
 * 按用户名更新。username 是定位键，本身不会被修改
 * （后端 UpdateUserService 只写 password / phone / email 三个字段）。
 */
export const updateUserByName = (payload: UserPayload): Promise<User> =>
  postQuery<RawUser>('/user/update_user', { ...payload }).then(toUser)

/** 按主键更新。同样只写 password / phone / email，改不了 username。 */
export const updateUserById = (id: number, payload: Omit<UserPayload, 'username'>): Promise<User> =>
  postQuery<RawUser>('/user/update_id', { id, ...payload }).then(toUser)

export const deleteUser = (id: number): Promise<void> =>
  postQuery<void>('/user/delete', { id })
