<template>
  <div class="sys-log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📋 系统日志</span>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="日志类型">
          <el-select v-model="queryParams.logType" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="item in LOG_TYPES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="queryParams.operator" placeholder="请输入操作人" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 100px">
            <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作按钮 -->
      <div class="table-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>
      
      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="logType" label="日志类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.logType === 'ERROR' ? 'danger' : row.logType === 'WARN' ? 'warning' : 'info'">
              {{ row.logType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="日志类型" prop="logType">
          <el-select v-model="formData.logType" placeholder="请选择日志类型" style="width: 100%">
            <el-option v-for="item in LOG_TYPES" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="3" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="formData.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="formData.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">成功</el-radio>
            <el-radio :value="1">失败</el-radio>
          </el-radio-group>
        </el-form-item>
        <AttachmentUpload
          ref="attachmentRef"
          target-type="sys_log"
          :target-id="formData.id?.toString() || ''"
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="日志类型">{{ detailData.logType }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">{{ detailData.content }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
            {{ detailData.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import AttachmentUpload from './AttachmentUpload.vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getLogPage, getLogById, addLog, updateLog, deleteLog, batchDeleteLog } from '@/api/log'
import type { SysLog, LogQuery } from '@/types'
import { LOG_TYPES, STATUS_OPTIONS } from '@/types'

const loading = ref(false)
const tableData = ref<SysLog[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<LogQuery>({
  pageNum: 1,
  pageSize: 10,
  logType: '',
  title: '',
  operator: '',
  status: undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const detailVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<SysLog>({} as SysLog)
const detailData = ref<SysLog>({} as SysLog)
const attachmentRef = ref<InstanceType<typeof AttachmentUpload>>()

const formRules: FormRules = {
  logType: [{ required: true, message: '请选择日志类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLogPage(queryParams)
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
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    logType: '',
    title: '',
    operator: '',
    status: undefined
  })
  fetchData()
}

const handleSelectionChange = (selection: SysLog[]) => {
  selectedIds.value = selection.map(item => item.id!)
}

const handleAdd = () => {
  dialogTitle.value = '新增日志'
  formData.value = { logType: 'INFO', status: 0 } as SysLog
  dialogVisible.value = true
  nextTick(() => {
    attachmentRef.value?.loadAttachments()
  })
}

const handleEdit = async (row: SysLog) => {
  dialogTitle.value = '编辑日志'
  const res = await getLogById(row.id!)
  formData.value = res
  dialogVisible.value = true
  nextTick(() => {
    attachmentRef.value?.loadAttachments()
  })
}

const handleView = async (row: SysLog) => {
  const res = await getLogById(row.id!)
  detailData.value = res
  detailVisible.value = true
}

const handleDelete = (row: SysLog) => {
  ElMessageBox.confirm('确定要删除该日志吗？', '提示', { type: 'warning' })
    .then(() => {
      deleteLog(row.id!).then(() => {
        ElMessage.success('删除成功')
        fetchData()
      })
    })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条日志吗？`, '提示', { type: 'warning' })
    .then(() => {
      batchDeleteLog(selectedIds.value).then(() => {
        ElMessage.success('删除成功')
        fetchData()
      })
    })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (formData.value.id) {
    await updateLog(formData.value)
    ElMessage.success('更新成功')
  } else {
    const res = await addLog(formData.value)
    formData.value.id = res.data.id
    // 上传待上传的附件
    await attachmentRef.value?.uploadPendingFiles(res.data.id!.toString())
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
.sys-log-container {
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
