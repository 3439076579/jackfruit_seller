<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi } from '@/api'
import ProductFormDialog from '@/components/ProductFormDialog.vue'
import type { Category, Product } from '@/types/models'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const keyword = ref('')
const loading = ref(false)

const dialogVisible = ref(false)
const editing = ref<Product | null>(null)

const categoryDialogVisible = ref(false)
const newCategory = ref('')
const categorySubmitting = ref(false)

const filtered = computed(() => {
  const query = keyword.value.trim()
  if (!query) return products.value
  return products.value.filter((item) => item.name.includes(query))
})

async function load() {
  loading.value = true
  try {
    const [list, categoryList] = await Promise.all([
      productApi.fetchProducts(),
      productApi.fetchCategories(),
    ])
    products.value = list
    categories.value = categoryList
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  dialogVisible.value = true
}

function openEdit(row: Product) {
  editing.value = row
  dialogVisible.value = true
}

async function remove(row: Product) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」？删除后不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await productApi.deleteProduct(row.id)
    ElMessage.success('已删除')
    await load()
  } catch {
    // 错误提示由 request 层统一处理
  }
}

async function createCategory() {
  const name = newCategory.value.trim()
  if (!name) {
    ElMessage.warning('请输入分类名')
    return
  }
  categorySubmitting.value = true
  try {
    await productApi.addCategory(name)
    ElMessage.success('分类已添加')
    newCategory.value = ''
    categories.value = await productApi.fetchCategories()
  } catch {
    // 分类名重复会由后端唯一索引拦截
  } finally {
    categorySubmitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="按商品名搜索"
        clearable
        style="width: 240px"
      />
      <div class="actions">
        <el-button @click="categoryDialogVisible = true">分类管理</el-button>
        <el-button type="primary" @click="openCreate">新增商品</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filtered" stripe border style="width: 100%">
      <el-table-column label="图片" width="90" align="center">
        <template #default="{ row }">
          <el-image :src="row.image" fit="cover" class="thumb">
            <template #error>
              <div class="thumb-fallback">无图</div>
            </template>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="商品名" min-width="170" />

      <el-table-column label="分类" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.category" size="small" type="info">{{ row.category.name }}</el-tag>
          <span v-else class="muted">未分类</span>
        </template>
      </el-table-column>

      <el-table-column label="单价" width="110" align="right">
        <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
      </el-table-column>

      <el-table-column label="库存" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.storage > 0 ? 'success' : 'danger'" size="small">
            {{ row.storage }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="上架时间" width="120">
        <template #default="{ row }">{{ row.createdAt.slice(0, 10) }}</template>
      </el-table-column>

      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ProductFormDialog
      v-model="dialogVisible"
      :product="editing"
      :categories="categories"
      @saved="load"
    />

    <el-dialog v-model="categoryDialogVisible" title="分类管理" width="420px">
      <el-table :data="categories" size="small" border>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="分类名" />
      </el-table>

      <div class="category-add">
        <el-input
          v-model="newCategory"
          placeholder="输入新分类名"
          maxlength="50"
          @keyup.enter="createCategory"
        />
        <el-button type="primary" :loading="categorySubmitting" @click="createCategory">
          添加
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.thumb {
  width: 56px;
  height: 56px;
  border-radius: 6px;
}

.thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
}

.muted {
  color: #c0c4cc;
  font-size: 12px;
}

.category-add {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
</style>
