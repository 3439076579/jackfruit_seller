# jackfruit-frontend-V3

波罗蜜订购系统的前端重构版。Vue 2 → Vue 3，技术栈见下。**后端 `software_project_design/` 一行未改**，本工程完全通过既有 HTTP 接口对接。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup lang="ts">`） |
| 构建 | Vite 6 |
| 语言 | TypeScript（strict） |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| UI | Element Plus |
| 请求 | Axios |
| 规范 | ESLint 9（flat config）+ Prettier |

## 启动

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env.development` 默认 `VITE_USE_MOCK=false`，即接真实后端（需先启动 Go 服务，见下）。想不依赖后端看界面，把它改成 `true` 走**内置 Mock**，终端出现 `[mock] 已启用内存 Mock 接口` 即为生效。登录账号 `admin` / `123456`。

启动 Go 服务：

```bash
cd ../software_project_design
go run main.go     # http://localhost:8082
```

两种模式的完整操作步骤、MySQL 建库建表、常见错误排查，见 **[docs/启动方案.md](docs/启动方案.md)**。

其他命令：`npm run build`（含类型检查）、`npm run type-check`、`npm run lint`、`npm run format`。

## 分层

```
src/
├── api/          一实体一文件，只发请求 + 调 adapter，不含业务判断
├── adapters/     后端 raw → 前端 model 的转换（本工程的核心补丁层）
├── types/
│   ├── api.ts    统一响应包装 ApiResponse<T>
│   ├── raw.ts    后端原始契约，字段名如实照抄
│   └── models.ts 前端领域模型，camelCase，页面只认这个
├── stores/       Pinia，目前只有 user
├── router/       路由表 + 登录守卫
├── layouts/      商城 / 后台两套外壳
├── views/        路由级页面
├── components/   可复用组件（待沉淀）
└── utils/        request.ts：axios 实例 + 三种取参函数

mock/             开发期内存 Mock 接口（返回 raw 契约，不进生产构建）
docs/             运行指南
```

依赖方向是单向的：`views → api → (request, adapters) → types`。页面不直接写 `axios`，也不直接接触 `raw.ts`。

## 后端契约注意点

这套接口有几个既有事实，重构时必须照做，否则会静默出错：

1. **没有 JSON body。** `/user/*` 全部 `c.Query`（含 POST），商品/订单/评价/公告的新增走 `c.PostForm`。所以 `utils/request.ts` 只暴露 `get` / `postQuery` / `postForm` 三个函数。写成 `post(url, { username })` 会把参数塞进 body，后端读到空串并返回 "record not found"——不报错，只失败。
2. **错误也是 HTTP 200。** 判据是 `status_code !== 0`，在 `unwrap()` 里主动 throw，axios 的 reject 分支抓不到业务错误。
3. **有两种命名风格。** 显式写了 json tag 的字段是 `snake_case`；`gorm.Model` 的四个字段和 `NotifyModel.Message` 没有 tag，输出 PascalCase（`ID`、`CreatedAt`、`Message`）。全部由 adapters 吸收。
4. **关联字段是值类型。** `Order.Jackfruit` / `Order.User` 未 Preload 时不是 `null`，而是 `ID = 0` 的空对象，所以 adapters 用 `ID > 0` 判断有无。
5. **后端零校验的地方，前端要兜住。** 下单的 `total` 由前端算（`quantity × price`，与旧前端一致）；商品更新时 `storage = 0` 或 `price = 0` 会被当成"不修改"，因此无法把库存或价格改为 0；`/jackfruit/add` 强制要求图片文件。

## 账户与权限

| 账户 | 密码 | 角色 | 数据 |
| --- | --- | --- | --- |
| `admin` | `123456` | 管理员 | 1 条订单、1 条评价 |
| `omnis` | `123456` | 普通会员 | 1 条订单、2 条评价 |
| `user01` | `123456` | 普通会员 | 1 条订单，手机/邮箱未填 |

角色判定集中在 `src/config/permissions.ts`，因为**后端 user 表没有角色字段**，接口也不返回权限信息，只能在前端用用户名白名单约定。

> ⚠️ 这只是界面可见性控制，**不是安全边界**。后端所有接口都没有鉴权中间件，
> 普通账户直接调 `/user/delete` 一样能删数据。真正的权限必须落在后端。

要做真权限，后端约 3 行改动即可：`UserModel` 加 `IsAdmin bool` 字段、登录时返回它、前端把白名单换成读接口字段。

## 已完成页面

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/login` | 登录 / 注册 | 表单校验、自动登录、支持 redirect 回跳 |
| `/shop/products` | 每日推荐 | 商品卡片、详情、**下单**、**评价** |
| `/shop/orders` | 我的订单 | 个人订单列表、金额与地址 |
| `/shop/profile` | 个人中心 | 资料修改、密码修改、消费统计 |
| `/admin/dashboard` | 后台首页 | 四项指标 + 销量 TOP5 + 分类销售额 + 最新公告 |
| `/admin/products` | 波罗蜜管理 | 增删改查、图片上传、分类管理 |
| `/admin/users` | 会员管理 | 增删改查（用户名不可改，后端限制） |
| `/admin/orders` | 订单管理 | 订单号搜索、分页、金额合计 |
| `/admin/analytics` | 统计分析 | 销量排行、分类销售额、高分商品筛选 |

后台顶栏头像菜单里还有「发布公告」，发布后商城首页会以通知形式弹出。

业务闭环已打通：**后台加商品 → 商城下单（扣库存）→ 后台看订单与统计 → 商城评价**。

新增页面的写法参考 `views/shop/ProductListView.vue`：从 `@/api` 取数，组件只消费 `@/types/models` 的模型，不碰 `raw.ts`。

## 与旧前端的关系

旧的两个前端（`波罗蜜前台管理系统/`、`波罗蜜后台管理系统/`）保持原样，可作为字段与交互的对照参考——遇到"这个值到底是什么"的疑问，开旧页面点一遍比读后端源码快。
