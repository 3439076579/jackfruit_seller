<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Order } from '@/types/models'

const router = useRouter()
const userStore = useUserStore()

const orders = ref<Order[]>([])
const loading = ref(false)

const page = ref(1)
const pageSize = ref(5)

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return orders.value.slice(start, start + pageSize.value)
})

// 改每页条数后回到第一页，避免页码越界显示空白
watch(pageSize, () => {
  page.value = 1
})

const priceOf = (order: Order) =>
  order.product ? `¥${order.product.price.toFixed(2)}` : '—'

async function load() {
  if (!userStore.userId) return
  loading.value = true
  try {
    orders.value = await orderApi.fetchMyOrders(userStore.userId)
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="order-page">
    <el-empty v-if="!loading && !orders.length" description="还没有下过单">
      <el-button type="primary" @click="router.push({ name: 'shop-products' })">
        去挑一个波罗蜜
      </el-button>
    </el-empty>

    <div v-for="order in paged" :key="order.id" class="order-card">
      <div class="head">
        <span class="no">订单号 #{{ order.id }}</span>
        <span class="time">{{ order.createdAt.slice(0, 16).replace('T', ' ') }}</span>
      </div>

      <div class="body">
        <el-image :src="order.product?.image" fit="cover" class="cover">
          <template #error><div class="cover-fallback">无图</div></template>
        </el-image>

        <div class="info">
          <p class="name">{{ order.product?.name ?? '商品已下架' }}</p>
          <p class="meta">单价 {{ priceOf(order) }} × {{ order.quantity }} 件</p>
          <p class="addr">收货地址：{{ order.address }}</p>
        </div>

        <div class="amount">
          <span class="label">实付</span>
          <span class="value">¥{{ order.total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div v-if="orders.length" class="pager">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="orders.length"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<style scoped>
.order-page {
  min-height: 200px;
}

.order-card {
  margin-bottom: 14px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
}

.head {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f2f6fc;
  background-color: #fafcff;
  font-size: 12px;
  color: #909399;
}

.no {
  color: #606266;
}

.body {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.cover {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  border-radius: 8px;
}

.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
}

.info {
  flex: 1;
  min-width: 0;
}

.info p {
  margin: 0 0 4px;
  font-size: 13px;
}

.info p:last-child {
  margin-bottom: 0;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.meta {
  color: #909399;
}

.addr {
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount {
  flex: 0 0 auto;
  text-align: right;
}

.amount .label {
  display: block;
  font-size: 12px;
  color: #909399;
}

.amount .value {
  font-size: 18px;
  font-weight: 500;
  color: #f56c6c;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
