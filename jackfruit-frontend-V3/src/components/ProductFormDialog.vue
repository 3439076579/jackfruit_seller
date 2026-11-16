<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  ElMessage,
  type FormInstance,
  type FormRules,
  type UploadFile,
  type UploadUserFile,
} from 'element-plus'
import { productApi } from '@/api'
import type { Category, Product } from '@/types/models'

const props = defineProps<{
  /** 传 null 表示新增 */
  product: Product | null
  categories: Category[]
}>()

const emit = defineEmits<{ saved: [] }>()
const visible = defineModel<boolean>({ default: false })

const formRef = ref<FormInstance>()
const submitting = ref(false)
const fileList = ref<UploadUserFile[]>([])

const isEdit = computed(() => props.product !== null)

const form = reactive({
  name: '',
  categoryId: 0 as number,
  storage: 0,
  price: 0,
  feature: '',
  managementInfo: '',
  plantIntro: '',
  image: null as File | null,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  storage: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
}

function resetForm() {
  const source = props.product
  form.name = source?.name ?? ''
  form.categoryId = source?.categoryId ?? props.categories[0]?.id ?? 0
  form.storage = source?.storage ?? 0
  form.price = source?.price ?? 0
  form.feature = source?.feature ?? ''
  form.managementInfo = source?.managementInfo ?? ''
  form.plantIntro = source?.plantIntro ?? ''
  form.image = null
  fileList.value = []
  formRef.value?.clearValidate()
}

watch(visible, (open) => {
  if (open) resetForm()
})

// fileList 由 v-model:file-list 托管，这里只同步出 File 供提交使用
function onFileChange(file: UploadFile) {
  form.image = file.raw ?? null
}

function onFileRemove() {
  form.image = null
}

function onExceed() {
  ElMessage.warning('只能上传一张图片，请先移除已选的')
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const editing = props.product
  if (!editing && !form.image) {
    // 后端 AddProduct 里 FormFile 失败会直接返回错误，新增必须带图
    ElMessage.warning('新增商品必须上传图片')
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: editing ? editing.name : form.name,
      storage: form.storage,
      price: form.price,
      categoryId: form.categoryId,
      feature: form.feature,
      managementInfo: form.managementInfo,
      plantIntro: form.plantIntro,
      image: form.image,
    }
    if (editing) {
      await productApi.updateProduct(payload)
      ElMessage.success('已保存')
    } else {
      await productApi.addProduct(payload)
      ElMessage.success('已添加')
    }
    visible.value = false
    emit('saved')
  } catch {
    // 错误提示由 request 层统一处理
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑商品' : '新增商品'" width="560px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="商品名" prop="name">
        <el-input v-model.trim="form.name" :disabled="isEdit" placeholder="请输入商品名" />
        <p v-if="isEdit" class="tip">商品名是后端定位记录的唯一依据，不可修改</p>
      </el-form-item>

      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="库存" prop="storage">
        <el-input-number v-model="form.storage" :min="0" :precision="0" style="width: 100%" />
      </el-form-item>

      <el-form-item label="单价" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>

      <el-form-item label="特征">
        <el-input v-model.trim="form.feature" placeholder="如：果肉橙红、干包少汁" />
      </el-form-item>

      <el-form-item label="管理信息">
        <el-input v-model.trim="form.managementInfo" placeholder="存储方式、保质期等" />
      </el-form-item>

      <el-form-item label="种植介绍">
        <el-input v-model.trim="form.plantIntro" type="textarea" :rows="2" />
      </el-form-item>

      <el-form-item label="图片">
        <div class="upload-block">
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            :on-exceed="onExceed"
          >
            <el-button>选择图片</el-button>
          </el-upload>
          <p v-if="isEdit" class="tip">不选则保留原图</p>
        </div>
      </el-form-item>

      <el-alert
        v-if="isEdit"
        type="info"
        :closable="false"
        show-icon
        title="后端限制：库存或单价填 0 不会生效（0 被视为「不修改」）"
      />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.tip {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #c0c4cc;
}

.upload-block {
  width: 100%;
}
</style>
