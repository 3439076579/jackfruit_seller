<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 从 route.matched 生成面包屑。
 * 过滤掉没有 title 的布局层，避免出现空白节点。
 * Vue Router 4 的 record.path 已是规范化后的完整路径，可直接用于跳转。
 */
const items = computed(() => route.matched.filter((record) => Boolean(record.meta?.title)))
</script>

<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in items" :key="item.path">
      <span v-if="index === items.length - 1" class="current">{{ item.meta.title }}</span>
      <router-link v-else :to="{ path: item.path }" class="link">
        {{ item.meta.title }}
      </router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.app-breadcrumb {
  font-size: 13px;
}

.current {
  color: #303133;
  font-weight: 500;
}

.link {
  color: #909399;
  transition: color 0.2s;
}

.link:hover {
  color: #409eff;
}
</style>
