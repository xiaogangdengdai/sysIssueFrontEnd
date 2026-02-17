<template>
  <div class="issue-log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🐛 系统问题日志</span>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="问题描述">
          <el-input v-model="queryParams.description" placeholder="请输入" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="queryParams.creator" placeholder="请输入" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 100px">
            <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作按钮 -->
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      
      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="280" show-overflow-tooltip />
        <el-table-column prop="description" label="问题描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 3 ? 'success' : row.status === 2 ? 'warning' : 'danger'">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="问题描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入问题描述" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人" prop="creator">
          <el-input v-model="formData.creator" placeholder="请输入创建人" />
        </el-form-item>
        <AttachmentUpload
          ref="attachmentRef"
          target-type="system_issue_log"
          :target-id="formData.id || ''"
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import AttachmentUpload from './AttachmentUpload.vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getIssueLogPage, getIssueLogById, addIssueLog, updateIssueLog, deleteIssueLog, batchDeleteIssueLog } from '@/api/issueLog'
import type { SystemIssueLog, IssueLogQuery } from '@/types'
import { ISSUE_STATUS_OPTIONS } from '@/types'

const loading = ref(false)
const tableData = ref<SystemIssueLog[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<IssueLogQuery>({
  pageNum: 1,
  pageSize: 10,
  description: '',
  creator: '',
  status: undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = ref<SystemIssueLog>({} as SystemIssueLog)
const attachmentRef = ref<InstanceType<typeof AttachmentUpload>>()

const formRules: FormRules = {
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  creator: [{ required: true, message: '请输入创建人', trigger: 'blur' }]
}

const getStatusLabel = (status: number) => {
  const item = ISSUE_STATUS_OPTIONS.find(i => i.value === status)
  return item ? item.label : '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getIssueLogPage(queryParams)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(queryParams, { pageNum: 1, pageSize: 10, description: '', creator: '', status: undefined })
  fetchData()
}

const handleSelectionChange = (selection: SystemIssueLog[]) => {
  selectedIds.value = selection.map(item => item.id!)
}

const handleAdd = () => {
  dialogTitle.value = '新增问题'
  formData.value = { status: 1 } as SystemIssueLog
  dialogVisible.value = true
  // 清空附件
  nextTick(() => {
    attachmentRef.value?.loadAttachments()
  })
}

const handleEdit = async (row: SystemIssueLog) => {
  dialogTitle.value = '编辑问题'
  const res = await getIssueLogById(row.id!)
  formData.value = res.data
  dialogVisible.value = true
  // 加载附件
  nextTick(() => {
    attachmentRef.value?.loadAttachments()
  })
}

const handleDelete = (row: SystemIssueLog) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
    .then(() => {
      deleteIssueLog(row.id!).then(() => {
        ElMessage.success('删除成功')
        fetchData()
      })
    })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', { type: 'warning' })
    .then(() => {
      batchDeleteIssueLog(selectedIds.value).then(() => {
        ElMessage.success('删除成功')
        fetchData()
      })
    })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (formData.value.id) {
    await updateIssueLog(formData.value)
    ElMessage.success('更新成功')
  } else {
    const res = await addIssueLog(formData.value)
    formData.value.id = res.data.id
    // 上传待上传的附件
    await attachmentRef.value?.uploadPendingFiles(res.data.id!)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.issue-log-container {
  padding: 0;
}
.card-header {
  font-size: 16px;
  font-weight: bold;
}
.search-form {
  margin-bottom: 16px;
}
.table-operations {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
