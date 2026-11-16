<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  icon: Component
  /** 图标强调色 */
  accent?: string
  /** 数值后缀，如「元」「件」 */
  suffix?: string
}>()
</script>

<template>
  <el-card shadow="never" class="stat-card">
    <div class="row">
      <div class="text">
        <p class="label">{{ label }}</p>
        <p class="value">
          {{ value }}<span v-if="suffix" class="suffix">{{ suffix }}</span>
        </p>
      </div>
      <el-icon class="icon" :style="{ color: accent ?? '#409eff' }">
        <component :is="icon" />
      </el-icon>
    </div>
  </el-card>
</template>

<style scoped>
.stat-card {
  border-radius: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  margin: 0 0 6px;
  font-size: 13px;
  color: #909399;
}

.value {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
  color: #303133;
}

.suffix {
  margin-left: 3px;
  font-size: 13px;
  font-weight: 400;
  color: #909399;
}

.icon {
  font-size: 34px;
  opacity: 0.85;
}
</style>
