<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi, productApi } from '@/api'
import ReviewPanel from '@/components/ReviewPanel.vue'
import { useUserStore } from '@/stores/user'
import type { Product } from '@/types/models'

const userStore = useUserStore()

const products = ref<Product[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const current = ref<Product | null>(null)

const buyVisible = ref(false)
const buying = ref<Product | null>(null)
const submittingBuy = ref(false)
const buyForm = reactive({ address: '', quantity: 1 })

const buyTotal = computed(() => {
  if (!buying.value) return 0
  return Number((buying.value.price * buyForm.quantity).toFixed(2))
})

async function loadProducts() {
  loading.value = true
  try {
    products.value = await productApi.fetchProducts()
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(product: Product) {
  current.value = product
  dialogVisible.value = true
}

function openBuy(product: Product) {
  if (product.storage <= 0) {
    ElMessage.warning('该商品已售罄')
    return
  }
  buying.value = product
  buyForm.address = ''
  buyForm.quantity = 1
  buyVisible.value = true
}

async function submitBuy() {
  if (!buying.value) return
  if (!buyForm.address.trim()) {
    ElMessage.warning('请填写收货地址')
    return
  }

  submittingBuy.value = true
  try {
    await orderApi.createOrder({
      userId: userStore.userId,
      productId: buying.value.id,
      address: buyForm.address.trim(),
      quantity: buyForm.quantity,
      // 与旧前端保持一致：金额由前端计算，后端原样入库
      total: buyTotal.value,
    })
    ElMessage.success('下单成功')
    buyVisible.value = false
    dialogVisible.value = false
    // 库存已被扣减，重新拉一次列表
    await loadProducts()
  } catch {
    // 超出库存等错误由 request 层统一提示
  } finally {
    submittingBuy.value = false
  }
}

onMounted(loadProducts)
</script>

<template>
  <div v-loading="loading" class="product-list">
    <el-empty v-if="!loading && !products.length" description="暂无商品，请先在后台添加" />

    <el-row :gutter="16">
      <el-col v-for="product in products" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="product-card" shadow="hover" :body-style="{ padding: '0' }">
          <el-image :src="product.image" fit="cover" class="cover" lazy>
            <template #error>
              <div class="cover-fallback">暂无图片</div>
            </template>
          </el-image>

          <div class="info">
            <div class="row">
              <span class="name">{{ product.name }}</span>
              <el-tag v-if="product.category" size="small" type="info">
                {{ product.category.name }}
              </el-tag>
            </div>

            <div class="row">
              <span class="price">¥{{ product.price.toFixed(2) }}</span>
              <el-tag :type="product.storage > 0 ? 'success' : 'danger'" size="small">
                库存 {{ product.storage }}
              </el-tag>
            </div>

            <p class="feature">{{ product.feature || '暂无简介' }}</p>

            <div class="actions">
              <el-button size="small" plain @click="openDetail(product)">详情</el-button>
              <el-button
                size="small"
                type="primary"
                :disabled="product.storage <= 0"
                @click="openBuy(product)"
              >
                {{ product.storage > 0 ? '购买' : '已售罄' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="current?.name ?? '商品详情'" width="640px">
      <template v-if="current">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="价格">¥{{ current.price.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="库存">{{ current.storage }}</el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ current.category?.name ?? '未分类' }}
          </el-descriptions-item>
          <el-descriptions-item label="上架时间">
            {{ current.createdAt.slice(0, 10) }}
          </el-descriptions-item>
          <el-descriptions-item label="特征" :span="2">
            {{ current.feature || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="管理信息" :span="2">
            {{ current.managementInfo || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="种植介绍" :span="2">
            {{ current.plantIntro || '—' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">商品评价</el-divider>

        <ReviewPanel :product-id="current.id" :user-id="userStore.userId" />
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="(current?.storage ?? 0) <= 0"
          @click="current && openBuy(current)"
        >
          立即购买
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="buyVisible" title="确认订单" width="440px">
      <el-form :model="buyForm" label-width="80px">
        <el-form-item label="商品">{{ buying?.name }}</el-form-item>
        <el-form-item label="单价">¥{{ buying?.price.toFixed(2) }}</el-form-item>
        <el-form-item label="数量">
          <el-input-number
            v-model="buyForm.quantity"
            :min="1"
            :max="buying?.storage ?? 1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input
            v-model.trim="buyForm.address"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
            placeholder="请输入详细收货地址"
          />
        </el-form-item>
        <el-form-item label="合计">
          <span class="total">¥{{ buyTotal.toFixed(2) }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="buyVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingBuy" @click="submitBuy">提交订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.product-list {
  min-height: 200px;
}

.product-card {
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 170px;
  display: block;
}

.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 170px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 13px;
}

.info {
  padding: 12px 14px 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-size: 16px;
  font-weight: 500;
  color: #f56c6c;
}

.feature {
  margin: 0 0 12px;
  height: 36px;
  font-size: 12px;
  line-height: 18px;
  color: #909399;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions .el-button {
  flex: 1;
  margin-left: 0;
}

.total {
  font-size: 18px;
  font-weight: 500;
  color: #f56c6c;
}
</style>
