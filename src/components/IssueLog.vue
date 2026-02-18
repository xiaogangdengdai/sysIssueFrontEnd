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
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="item in TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="queryParams.creator" placeholder="请输入" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px">
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
        <el-table-column prop="type" label="类型" width="130">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessContext" label="业务介绍" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="230" fixed="right">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px">
      <el-form ref="formRef" :model="formData" :rules="dynamicFormRules" label-width="110px">
        <!-- 类型选择 -->
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%" @change="handleTypeChange">
            <el-option v-for="item in TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- SQL建表语句 -->
        <el-form-item v-if="fieldVisibility.createTableSql" label="SQL建表语句" :prop="fieldRequired.createTableSql ? 'createTableSql' : ''">
          <el-input v-model="formData.createTableSql" type="textarea" :rows="6" placeholder="请输入SQL建表语句" />
        </el-form-item>

        <!-- 新需求描述 (type=2或4显示) -->
        <el-form-item v-if="fieldVisibility.newRequirement" label="新需求描述" prop="newRequirement">
          <el-input v-model="formData.newRequirement" type="textarea" :rows="4" placeholder="请输入新需求描述" />
        </el-form-item>

        <!-- 改造前功能描述 (type=3显示) -->
        <el-form-item v-if="fieldVisibility.beforeTransformation" label="改造前功能" prop="beforeTransformation">
          <el-input v-model="formData.beforeTransformation" type="textarea" :rows="4" placeholder="请输入改造前功能描述" />
        </el-form-item>

        <!-- 改造后的目标 (type=3显示) -->
        <el-form-item v-if="fieldVisibility.transformation" label="改造后目标" prop="transformation">
          <el-input v-model="formData.transformation" type="textarea" :rows="4" placeholder="请输入改造后的目标" />
        </el-form-item>

        <!-- 业务介绍 (始终显示) -->
        <el-form-item label="业务介绍" prop="businessContext">
          <el-input v-model="formData.businessContext" type="textarea" :rows="4" placeholder="请输入业务介绍" />
        </el-form-item>

        <!-- 状态 (始终显示) -->
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="formData.status"
            placeholder="请选择状态"
            style="width: 100%"
            :disabled="!formData.id"
          >
            <el-option v-for="item in ISSUE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div v-if="!formData.id" class="status-tip">新建记录时状态默认为"待处理"</div>
        </el-form-item>

        <!-- 备注 (始终显示，非必填) -->
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>

        <!-- 附件上传 (始终显示) -->
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
    <el-dialog v-model="viewDialogVisible" title="查看详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="类型">
          <el-tag :type="getTypeTagType(viewData.type)">
            {{ getTypeLabel(viewData.type) }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item v-if="viewFieldVisibility.createTableSql" label="SQL建表语句">
          <pre class="view-pre">{{ viewData.createTableSql || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item v-if="viewFieldVisibility.newRequirement" label="新需求描述">
          <pre class="view-pre">{{ viewData.newRequirement || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item v-if="viewFieldVisibility.beforeTransformation" label="改造前功能">
          <pre class="view-pre">{{ viewData.beforeTransformation || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item v-if="viewFieldVisibility.transformation" label="改造后目标">
          <pre class="view-pre">{{ viewData.transformation || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item label="业务介绍">
          <pre class="view-pre">{{ viewData.businessContext || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewData.status)">
            {{ getStatusLabel(viewData.status) }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="备注">
          <pre class="view-pre">{{ viewData.remark || '-' }}</pre>
        </el-descriptions-item>

        <el-descriptions-item label="创建人">
          {{ viewData.creator || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="创建人IP">
          {{ viewData.creatorIp || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间">
          {{ viewData.createdAt || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="修改人">
          {{ viewData.modifyUser || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="修改人IP">
          {{ viewData.modifyIp || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="修改时间">
          {{ viewData.modifyAt || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 附件 (type=1) -->
      <div class="attachment-section">
        <h4>附件</h4>
        <AttachmentView
          target-type="system_issue_log"
          :target-id="viewData.id || ''"
          :type="1"
        />
      </div>

      <!-- 系统生成附件 (type=2) -->
      <div class="attachment-section">
        <h4>系统生成附件</h4>
        <AttachmentView
          target-type="system_issue_log"
          :target-id="viewData.id || ''"
          :type="2"
        />
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import AttachmentUpload from './AttachmentUpload.vue'
import AttachmentView from './AttachmentView.vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getIssueLogPage, getIssueLogById, addIssueLog, updateIssueLog, deleteIssueLog, batchDeleteIssueLog } from '@/api/issueLog'
import type { SystemIssueLog, IssueLogQuery } from '@/types'
import { TYPE_OPTIONS, ISSUE_STATUS_OPTIONS } from '@/types'

const loading = ref(false)
const tableData = ref<SystemIssueLog[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<IssueLogQuery>({
  pageNum: 1,
  pageSize: 10,
  type: undefined,
  creator: '',
  status: undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = ref<SystemIssueLog>({} as SystemIssueLog)
const attachmentRef = ref<InstanceType<typeof AttachmentUpload>>()

// View dialog state
const viewDialogVisible = ref(false)
const viewData = ref<SystemIssueLog>({} as SystemIssueLog)

const viewFieldVisibility = computed(() => {
  const config = getFieldConfig(viewData.value.type || 1)
  return {
    createTableSql: config.createTableSql,
    newRequirement: config.newRequirement,
    beforeTransformation: config.beforeTransformation,
    transformation: config.transformation
  }
})

const handleView = async (row: SystemIssueLog) => {
  const res = await getIssueLogById(row.id!)
  viewData.value = res.data
  viewDialogVisible.value = true
}

/**
 * 根据type获取字段显示配置
 */
const getFieldConfig = (type: number) => {
  const config = {
    createTableSql: false,
    newRequirement: false,
    beforeTransformation: false,
    transformation: false,
    createTableSqlRequired: false,
    newRequirementRequired: false,
    beforeTransformationRequired: false,
    transformationRequired: false
  }

  switch (type) {
    case 1: // bug修复
      config.createTableSql = true
      config.createTableSqlRequired = false
      break
    case 2: // 新功能开发
      config.createTableSql = true
      config.newRequirement = true
      config.createTableSqlRequired = true
      config.newRequirementRequired = true
      break
    case 3: // 原有功能改造
      config.createTableSql = true
      config.beforeTransformation = true
      config.transformation = true
      config.createTableSqlRequired = false
      config.beforeTransformationRequired = true
      config.transformationRequired = true
      break
    case 4: // 页面原型快速实现
      config.createTableSql = true
      config.newRequirement = true
      config.createTableSqlRequired = true
      config.newRequirementRequired = true
      break
  }

  return config
}

/**
 * 字段显示状态
 */
const fieldVisibility = computed(() => {
  const config = getFieldConfig(formData.value.type || 1)
  return {
    createTableSql: config.createTableSql,
    newRequirement: config.newRequirement,
    beforeTransformation: config.beforeTransformation,
    transformation: config.transformation
  }
})

/**
 * 字段必填状态
 */
const fieldRequired = computed(() => {
  const config = getFieldConfig(formData.value.type || 1)
  return {
    createTableSql: config.createTableSqlRequired,
    newRequirement: config.newRequirementRequired,
    beforeTransformation: config.beforeTransformationRequired,
    transformation: config.transformationRequired
  }
})

/**
 * 动态表单验证规则
 */
const dynamicFormRules = computed<FormRules>(() => {
  const rules: FormRules = {
    type: [{ required: true, message: '请选择类型', trigger: 'change' }],
    businessContext: [{ required: true, message: '请输入业务介绍', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const required = fieldRequired.value

  if (required.createTableSql) {
    rules.createTableSql = [{ required: true, message: '请输入SQL建表语句', trigger: 'blur' }]
  }
  if (required.newRequirement) {
    rules.newRequirement = [{ required: true, message: '请输入新需求描述', trigger: 'blur' }]
  }
  if (required.beforeTransformation) {
    rules.beforeTransformation = [{ required: true, message: '请输入改造前功能描述', trigger: 'blur' }]
  }
  if (required.transformation) {
    rules.transformation = [{ required: true, message: '请输入改造后的目标', trigger: 'blur' }]
  }

  return rules
})

/**
 * 类型变更处理
 */
const handleTypeChange = () => {
  // 清空不再显示的字段
  const visibility = fieldVisibility.value
  if (!visibility.createTableSql) formData.value.createTableSql = ''
  if (!visibility.newRequirement) formData.value.newRequirement = ''
  if (!visibility.beforeTransformation) formData.value.beforeTransformation = ''
  if (!visibility.transformation) formData.value.transformation = ''

  // 清除表单验证
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const getTypeLabel = (type: number) => {
  const item = TYPE_OPTIONS.find(i => i.value === type)
  return item ? item.label : '未知'
}

const getTypeTagType = (type: number) => {
  const typeMap: Record<number, string> = {
    1: 'danger',
    2: 'success',
    3: 'warning',
    4: 'primary'
  }
  return typeMap[type] || 'info'
}

const getStatusLabel = (status: number) => {
  const item = ISSUE_STATUS_OPTIONS.find(i => i.value === status)
  return item ? item.label : '未知'
}

const getStatusTagType = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'danger',
    2: 'warning',
    3: 'success',
    4: 'info'
  }
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

const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(queryParams, { pageNum: 1, pageSize: 10, type: undefined, creator: '', status: undefined })
  fetchData()
}

const handleSelectionChange = (selection: SystemIssueLog[]) => {
  selectedIds.value = selection.map(item => item.id!)
}

const handleAdd = () => {
  dialogTitle.value = '新增问题'
  formData.value = { type: 1, status: 1, businessContext: '' } as SystemIssueLog
  dialogVisible.value = true
  // 清空附件
  nextTick(() => {
    formRef.value?.clearValidate()
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
.status-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.view-pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}
.attachment-section {
  margin-top: 20px;
}
.attachment-section h4 {
  margin-bottom: 10px;
  font-size: 14px;
  color: #303133;
}
</style>
