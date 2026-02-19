<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <span class="title">☕ 后台类深度分析</span>
          <div class="placeholder"></div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="queryParams.creator" placeholder="请输入" clearable style="width: 150px" />
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
        <el-table-column prop="description" label="后台类或方法" min-width="300" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="后台类或方法" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="6" placeholder="请输入Java类名或方法名，例如：com.example.service.UserService 或 UserService.findById" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%" :disabled="!formData.id">
            <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div v-if="!formData.id" class="status-tip">新建记录时状态默认为"待处理"</div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="查看详情" width="900px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="后台类或方法">
          <pre class="view-pre">{{ viewData.description || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewData.status)">
            {{ getStatusLabel(viewData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          <pre class="view-pre">{{ viewData.remark || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="AI反馈">
          <pre class="view-pre">{{ viewData.aiResponse || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ viewData.creator || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createdAt || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="attachment-section">
        <h4>附件</h4>
        <AttachmentView target-type="system_issue_log" :target-id="viewData.id || ''" :type="1" />
      </div>

      <div class="attachment-section">
        <h4>系统生成附件</h4>
        <AttachmentView target-type="system_issue_log" :target-id="viewData.id || ''" :type="2" />
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import AttachmentUpload from './AttachmentUpload.vue'
import AttachmentView from './AttachmentView.vue'
import { getIssueLogPage, getIssueLogById, addIssueLog, updateIssueLog, deleteIssueLog, batchDeleteIssueLog } from '@/api/issueLog'
import type { SystemIssueLog, IssueLogQuery } from '@/types'
import { ISSUE_STATUS_OPTIONS } from '@/types'

const router = useRouter()
const PAGE_TYPE = 5 // 后台类深度分析

const loading = ref(false)
const tableData = ref<SystemIssueLog[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<IssueLogQuery>({
  pageNum: 1,
  pageSize: 10,
  type: PAGE_TYPE,
  creator: '',
  status: undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = ref<SystemIssueLog>({} as SystemIssueLog)
const attachmentRef = ref<InstanceType<typeof AttachmentUpload>>()

const viewDialogVisible = ref(false)
const viewData = ref<SystemIssueLog>({} as SystemIssueLog)

const formRules: FormRules = {
  description: [{ required: true, message: '请输入后台类或方法', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const goBack = () => router.push('/')

const getStatusLabel = (status: number) => {
  const item = ISSUE_STATUS_OPTIONS.find(i => i.value === status)
  return item ? item.label : '未知'
}

const getStatusTagType = (status: number) => {
  const statusMap: Record<number, string> = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info' }
  return statusMap[status] || 'info'
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

const handleSearch = () => { queryParams.pageNum = 1; fetchData() }
const handleReset = () => {
  Object.assign(queryParams, { pageNum: 1, pageSize: 10, type: PAGE_TYPE, creator: '', status: undefined })
  fetchData()
}
const handleSelectionChange = (selection: SystemIssueLog[]) => { selectedIds.value = selection.map(item => item.id!) }

const handleAdd = () => {
  dialogTitle.value = '新增后台类分析'
  formData.value = { type: PAGE_TYPE, status: 1, description: '', businessContext: '' } as SystemIssueLog
  dialogVisible.value = true
  nextTick(() => { formRef.value?.clearValidate(); attachmentRef.value?.loadAttachments() })
}

const handleEdit = async (row: SystemIssueLog) => {
  dialogTitle.value = '编辑后台类分析'
  const res = await getIssueLogById(row.id!)
  formData.value = res.data
  dialogVisible.value = true
  nextTick(() => { attachmentRef.value?.loadAttachments() })
}

const handleView = async (row: SystemIssueLog) => {
  const res = await getIssueLogById(row.id!)
  viewData.value = res.data
  viewDialogVisible.value = true
}

const handleDelete = (row: SystemIssueLog) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
    .then(() => { deleteIssueLog(row.id!).then(() => { ElMessage.success('删除成功'); fetchData() }) })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', { type: 'warning' })
    .then(() => { batchDeleteIssueLog(selectedIds.value).then(() => { ElMessage.success('删除成功'); fetchData() }) })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (formData.value.id) {
    await updateIssueLog(formData.value)
    ElMessage.success('更新成功')
  } else {
    const res = await addIssueLog(formData.value)
    formData.value.id = res.data.id
    await attachmentRef.value?.uploadPendingFiles(res.data.id!)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  fetchData()
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.title { font-size: 18px; font-weight: bold; }
.placeholder { width: 80px; }
.search-form { margin-bottom: 16px; }
.table-operations { margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
.status-tip { font-size: 12px; color: #909399; margin-top: 4px; }
.view-pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
.attachment-section { margin-top: 20px; }
.attachment-section h4 { margin-bottom: 10px; font-size: 14px; color: #303133; }
</style>
