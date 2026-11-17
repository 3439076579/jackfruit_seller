<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { orderApi } from '@/api'
import type { Order } from '@/types/models'

const orders = ref<Order[]>([])
const keyword = ref('')
const loading = ref(false)
const page = ref(1)
const pageSize = ref(8)

const filtered = computed(() => {
  const query = keyword.value.trim()
  if (!query) return orders.value
  return orders.value.filter((item) => String(item.id).includes(query))
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const totalAmount = computed(() =>
  filtered.value.reduce((sum, item) => sum + item.total, 0),
)

watch(filtered, () => {
  page.value = 1
})

async function load() {
  loading.value = true
  try {
    orders.value = await orderApi.fetchAllOrders()
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="按订单号搜索" clearable style="width: 240px" />
      <span class="summary">
        共 {{ filtered.length }} 单，合计
        <strong>¥{{ totalAmount.toFixed(2) }}</strong>
      </span>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="notice"
      title="后端 /order 接口未返回用户字段（OrderUserId 的 json tag 是 -），因此订单无法关联买家，此处不展示会员信息"
    />

    <el-table v-loading="loading" :data="paged" stripe border style="width: 100%">
      <el-table-column label="订单号" width="100" align="center">
        <template #default="{ row }">#{{ row.id }}</template>
      </el-table-column>

      <el-table-column label="商品" width="90" align="center">
        <template #default="{ row }">
          <el-image v-if="row.product" :src="row.product.image" fit="cover" class="thumb">
            <template #error><div class="thumb-fallback">无图</div></template>
          </el-image>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>

      <el-table-column label="商品名" min-width="170">
        <template #default="{ row }">
          <span v-if="row.product">{{ row.product.name }}</span>
          <span v-else class="muted">商品已删除</span>
        </template>
      </el-table-column>

      <el-table-column label="数量" width="80" align="center">
        <template #default="{ row }">{{ row.quantity }}</template>
      </el-table-column>

      <el-table-column label="金额" width="110" align="right">
        <template #default="{ row }">
          <span class="amount">¥{{ row.total.toFixed(2) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="address" label="收货地址" min-width="220" show-overflow-tooltip />

      <el-table-column label="下单时间" width="150">
        <template #default="{ row }">
          {{ row.createdAt.slice(0, 16).replace('T', ' ') }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="filtered.length"
        :page-sizes="[8, 15, 30]"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary {
  font-size: 13px;
  color: #909399;
}

.summary strong {
  font-weight: 500;
  color: #f56c6c;
}

.notice {
  margin-bottom: 14px;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
}

.thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
}

.amount {
  color: #f56c6c;
}

.muted {
  color: #c0c4cc;
  font-size: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
