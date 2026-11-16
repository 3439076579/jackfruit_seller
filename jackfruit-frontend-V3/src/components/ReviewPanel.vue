<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { reviewApi } from '@/api'
import type { Review } from '@/types/models'

const props = defineProps<{
  productId: number
  /** 0 表示未登录，此时只读 */
  userId: number
}>()

const reviews = ref<Review[]>([])
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  rating: 5,
  content: '',
})

async function load() {
  loading.value = true
  try {
    reviews.value = await reviewApi.fetchReviews(props.productId)
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!props.userId) {
    ElMessage.warning('请先登录后再评价')
    return
  }
  submitting.value = true
  try {
    await reviewApi.addReview({
      userId: props.userId,
      productId: props.productId,
      rating: form.rating,
      content: form.content.trim(),
    })
    ElMessage.success('评价已提交')
    form.content = ''
    form.rating = 5
    await load()
  } catch {
    // 后端唯一索引会拦住重复评价，错误提示已由 request 层统一弹出
  } finally {
    submitting.value = false
  }
}

watch(() => props.productId, load, { immediate: true })
</script>

<template>
  <div class="review-panel">
    <div v-loading="loading" class="list">
      <el-empty v-if="!loading && !reviews.length" description="还没有评价" :image-size="56" />

      <div v-for="review in reviews" :key="review.id" class="item">
        <div class="head">
          <el-avatar :size="22" class="avatar">
            {{ (review.user?.username ?? '匿').slice(0, 1) }}
          </el-avatar>
          <span class="name">{{ review.user?.username ?? '匿名用户' }}</span>
          <el-rate :model-value="review.rating" disabled size="small" />
          <span class="time">{{ review.createdAt.slice(0, 10) }}</span>
        </div>
        <p class="content">{{ review.content || '此用户没有填写评价内容' }}</p>
      </div>
    </div>

    <el-divider content-position="left">写评价</el-divider>

    <el-form label-width="56px" size="small" @submit.prevent>
      <el-form-item label="评分">
        <el-rate v-model="form.rating" show-text />
      </el-form-item>
      <el-form-item label="内容">
        <el-input
          v-model.trim="form.content"
          type="textarea"
          :rows="2"
          maxlength="255"
          show-word-limit
          placeholder="说说这个波罗蜜的口感、甜度、物流…"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="submit">提交评价</el-button>
        <span class="hint">同一商品每人只能评价一次</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.review-panel {
  font-size: 13px;
}

.list {
  max-height: 260px;
  overflow-y: auto;
}

.item {
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.item:last-child {
  border-bottom: none;
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  background-color: #dcdfe6;
  color: #606266;
  font-size: 12px;
}

.name {
  color: #606266;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: #c0c4cc;
}

.content {
  margin: 6px 0 0 30px;
  line-height: 1.6;
  color: #606266;
  word-break: break-word;
}

.hint {
  margin-left: 10px;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
