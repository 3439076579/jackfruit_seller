<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { analyticsApi } from '@/api'
import type { CategoryRevenueItem, HighRatingProductItem, SalesRankingItem } from '@/types/models'

const ranking = ref<SalesRankingItem[]>([])
const categoryRevenue = ref<CategoryRevenueItem[]>([])
const highRating = ref<HighRatingProductItem[]>([])
const minRating = ref(4)
const loading = ref(false)

const maxSales = computed(() => Math.max(1, ...ranking.value.map((item) => item.totalSales)))
const maxRevenue = computed(() =>
  Math.max(1, ...categoryRevenue.value.map((item) => item.totalRevenue)),
)
const ratio = (value: number, max: number) => Math.round((value / max) * 100)

async function loadAll() {
  loading.value = true
  const results = await Promise.allSettled([
    analyticsApi.fetchSalesRanking(),
    analyticsApi.fetchCategoryRevenue(),
    analyticsApi.fetchHighRating(minRating.value),
  ])
  if (results[0].status === 'fulfilled') ranking.value = results[0].value
  if (results[1].status === 'fulfilled') categoryRevenue.value = results[1].value
  if (results[2].status === 'fulfilled') highRating.value = results[2].value
  loading.value = false
}

async function reloadHighRating() {
  try {
    highRating.value = await analyticsApi.fetchHighRating(minRating.value)
  } catch {
    highRating.value = []
  }
}

onMounted(loadAll)
</script>

<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col :xs="24" :md="10">
        <el-card shadow="never">
          <template #header><span class="card-title">销量排行 TOP10</span></template>
          <el-empty v-if="!ranking.length" description="暂无订单" :image-size="60" />
          <div v-for="(item, index) in ranking" :key="item.productId" class="row">
            <span class="index" :class="{ active: index < 3 }">{{ index + 1 }}</span>
            <div class="body">
              <div class="head">
                <span class="name">{{ item.productName }}</span>
                <span class="meta">{{ item.totalSales }} 件 · ¥{{ item.totalRevenue.toFixed(2) }}</span>
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

      <el-col :xs="24" :md="7">
        <el-card shadow="never">
          <template #header><span class="card-title">分类销售额</span></template>
          <el-empty v-if="!categoryRevenue.length" description="暂无订单" :image-size="60" />
          <div v-for="item in categoryRevenue" :key="item.categoryName" class="row">
            <div class="body">
              <div class="head">
                <span class="name">{{ item.categoryName }}</span>
                <span class="meta">{{ item.orderCount }} 单</span>
              </div>
              <el-progress
                :percentage="ratio(item.totalRevenue, maxRevenue)"
                :stroke-width="6"
                :show-text="false"
                color="#67c23a"
              />
              <p class="revenue">¥{{ item.totalRevenue.toFixed(2) }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="7">
        <el-card shadow="never">
          <template #header>
            <div class="header-row">
              <span class="card-title">高分商品</span>
              <el-select v-model="minRating" size="small" style="width: 92px" @change="reloadHighRating">
                <el-option :value="5" label="5 分" />
                <el-option :value="4" label="4 分以上" />
                <el-option :value="3" label="3 分以上" />
              </el-select>
            </div>
          </template>
          <el-empty v-if="!highRating.length" description="没有符合条件的商品" :image-size="60" />
          <div v-for="item in highRating" :key="item.productId" class="high-row">
            <span class="name">{{ item.productName }}</span>
            <div class="high-meta">
              <el-rate :model-value="item.avgRating" disabled size="small" allow-half />
              <span class="meta">{{ item.avgRating.toFixed(1) }} 分 / {{ item.reviewCount }} 条</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}

.index {
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

.index.active {
  background-color: #409eff;
  color: #fff;
}

.body {
  flex: 1;
  min-width: 0;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
  font-size: 13px;
}

.name {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  flex: 0 0 auto;
  font-size: 12px;
  color: #909399;
}

.revenue {
  margin: 4px 0 0;
  font-size: 12px;
  color: #67c23a;
}

.high-row {
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.high-row:last-child {
  border-bottom: none;
}

.high-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
