<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Goods, List, Money, User } from '@element-plus/icons-vue'
import { analyticsApi, notifyApi, orderApi, productApi, userApi } from '@/api'
import StatCard from '@/components/StatCard.vue'
import type { CategoryRevenueItem, Notify, SalesRankingItem } from '@/types/models'

const loading = ref(false)
const userCount = ref(0)
const productCount = ref(0)
const orderCount = ref(0)
const revenue = ref(0)

const ranking = ref<SalesRankingItem[]>([])
const categoryRevenue = ref<CategoryRevenueItem[]>([])
const notify = ref<Notify | null>(null)

const maxSales = computed(() => Math.max(1, ...ranking.value.map((item) => item.totalSales)))
const maxCategoryRevenue = computed(() =>
  Math.max(1, ...categoryRevenue.value.map((item) => item.totalRevenue)),
)
const topRanking = computed(() => ranking.value.slice(0, 5))

const ratio = (value: number, max: number) => Math.round((value / max) * 100)

async function load() {
  loading.value = true
  // 用 allSettled：任一接口失败不影响其他卡片展示
  const results = await Promise.allSettled([
    userApi.fetchAllUsers(),
    productApi.fetchProducts(),
    orderApi.fetchAllOrders(),
    analyticsApi.fetchSalesRanking(),
    analyticsApi.fetchCategoryRevenue(),
    notifyApi.fetchLastNotify(),
  ])

  const [users, products, orders, sales, categories, latestNotify] = results

  if (users.status === 'fulfilled') userCount.value = users.value.length
  if (products.status === 'fulfilled') productCount.value = products.value.length
  if (orders.status === 'fulfilled') {
    orderCount.value = orders.value.length
    revenue.value = orders.value.reduce((sum, order) => sum + order.total, 0)
  }
  if (sales.status === 'fulfilled') ranking.value = sales.value
  if (categories.status === 'fulfilled') categoryRevenue.value = categories.value
  if (latestNotify.status === 'fulfilled') notify.value = latestNotify.value

  loading.value = false
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <el-row :gutter="16">
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard label="注册用户" :value="userCount" :icon="User" suffix="人" accent="#409eff" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard label="在售商品" :value="productCount" :icon="Goods" suffix="种" accent="#67c23a" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard label="订单总数" :value="orderCount" :icon="List" suffix="单" accent="#e6a23c" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard label="累计销售额" :value="revenue.toFixed(2)" :icon="Money" suffix="元" accent="#f56c6c" />
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section">
      <el-col :xs="24" :md="14">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">销量排行 TOP5</span>
          </template>
          <el-empty v-if="!topRanking.length" description="暂无订单数据" :image-size="60" />
          <div v-for="(item, index) in topRanking" :key="item.productId" class="rank-row">
            <span class="rank-index" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
            <div class="rank-body">
              <div class="rank-head">
                <span class="name">{{ item.productName }}</span>
                <span class="value">{{ item.totalSales }} 件 / ¥{{ item.totalRevenue.toFixed(2) }}</span>
              </div>
              <el-progress
                :percentage="ratio(item.totalSales, maxSales)"
                :stroke-width="6"
                :show-text="false"
                :color="index < 3 ? '#409eff' : '#c0c4cc'"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="notice-card">
          <template #header>
            <span class="card-title">最新公告</span>
          </template>
          <template v-if="notify">
            <p class="notice-text">{{ notify.message }}</p>
            <p class="notice-time">{{ notify.createdAt.slice(0, 10) }}</p>
          </template>
          <el-empty v-else description="还没有发布过公告" :image-size="60" />
        </el-card>

        <el-card shadow="never" class="category-card">
          <template #header>
            <span class="card-title">分类销售额</span>
          </template>
          <el-empty v-if="!categoryRevenue.length" description="暂无数据" :image-size="60" />
          <div v-for="item in categoryRevenue" :key="item.categoryName" class="category-row">
            <div class="category-head">
              <span>{{ item.categoryName }}</span>
              <span class="value">¥{{ item.totalRevenue.toFixed(2) }}</span>
            </div>
            <el-progress
              :percentage="ratio(item.totalRevenue, maxCategoryRevenue)"
              :stroke-width="6"
              :show-text="false"
              color="#67c23a"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.section {
  margin-top: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.rank-index {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.rank-index.top3 {
  background-color: #409eff;
  color: #fff;
}

.rank-body {
  flex: 1;
  min-width: 0;
}

.rank-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 13px;
}

.rank-head .name {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-head .value {
  flex: 0 0 auto;
  color: #909399;
}

.notice-card {
  margin-bottom: 16px;
}

.notice-text {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #606266;
}

.notice-time {
  margin: 0;
  font-size: 12px;
  color: #c0c4cc;
}

.category-row {
  padding: 6px 0;
}

.category-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
  color: #303133;
}

.category-head .value {
  color: #909399;
}
</style>
