<template>
  <div class="attachment-upload">
    <div class="attachment-label">附件</div>

    <!-- 附件列表 -->
    <div class="attachment-list">
      <div
        v-for="(file, index) in displayList"
        :key="file.id || file.fileName"
        class="attachment-item"
      >
        <!-- 图片类型 -->
        <div v-if="isImage(file.fileExt)" class="attachment-preview image-preview" @click="handlePreview(file, index)">
          <img v-if="file.id" :src="getDownloadUrl(file.id)" alt="preview" />
          <img v-else :src="file.localUrl!" alt="preview" />
        </div>

        <!-- 文本文件类型 -->
        <div v-else class="attachment-preview file-preview">
          <el-icon size="32"><Document /></el-icon>
          <span class="file-ext">{{ file.fileExt?.toUpperCase() }}</span>
        </div>

        <div class="attachment-info">
          <div class="file-name" :title="file.fileName">{{ file.fileName }}</div>
          <div class="file-size">{{ formatSize(file.fileSize) }}</div>
          <div v-if="!file.id" class="file-pending">待上传</div>
        </div>

        <div class="attachment-actions">
          <el-button v-if="file.id" type="primary" link size="small" @click="handleDownload(file)">
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 上传按钮 -->
      <div class="attachment-item upload-btn" @click="triggerUpload">
        <el-icon size="32"><Plus /></el-icon>
        <span>添加附件</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="800px">
      <img :src="previewImageUrl" style="width: 100%" />
    </el-dialog>

    <!-- 文本预览对话框 -->
    <el-dialog v-model="textPreviewVisible" title="文件预览" width="800px">
      <pre class="text-preview-content">{{ textPreviewContent }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Download, Delete, Document } from '@element-plus/icons-vue'
import {
  uploadAttachment,
  getAttachmentList,
  getAttachmentPreview,
  getDownloadUrl,
  deleteAttachment
} from '@/api/attachment'
import type { SysAttachment } from '@/types/attachment'

// 扩展类型，包含本地文件信息
interface PendingFile {
  id?: number
  type?: number
  targetType?: string
  targetId?: string
  fileName: string
  filePath?: string
  fileSize?: number
  fileType?: string
  fileExt?: string
  md5?: string
  sortOrder?: number
  remark?: string
  creator?: string
  createTime?: string
  updateTime?: string
  deleted?: number
  localUrl?: string  // 本地预览URL
  rawFile?: File     // 原始文件对象
}

const props = defineProps<{
  targetType: string
  targetId: string
  type?: number  // 可选参数，默认为1
}>()

const attachmentType = computed(() => props.type ?? 1)

const fileInput = ref<HTMLInputElement>()
const fileList = ref<SysAttachment[]>([])  // 已上传的文件
const pendingFiles = ref<PendingFile[]>([])  // 待上传的文件

const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const textPreviewVisible = ref(false)
const textPreviewContent = ref('')

// 合并显示列表
const displayList = computed(() => [...fileList.value, ...pendingFiles.value] as PendingFile[])

// 允许的文件类型
const acceptTypes = '.txt,.md,.json,.xml,.yaml,.yml,.log,.csv,.jpg,.jpeg,.png,.gif,.webp'

// 判断是否为图片
const isImage = (ext?: string) => {
  if (!ext) return false
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())
}

// 格式化文件大小
const formatSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 校验文件类型
  const ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
  const allowedExts = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'log', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'webp']
  if (!allowedExts.includes(ext)) {
    ElMessage.error('不支持的文件类型')
    target.value = ''
    return
  }

  // 如果有 targetId，直接上传
  if (props.targetId) {
    try {
      const res = await uploadAttachment(file, props.targetType, props.targetId, attachmentType.value)
      fileList.value.push(res.data)
      ElMessage.success('上传成功')
    } catch (error) {
      ElMessage.error('上传失败')
    }
  } else {
    // 否则暂存到待上传列表
    const pendingFile: PendingFile = {
      fileName: file.name,
      fileExt: ext,
      fileSize: file.size,
      fileType: file.type,
      localUrl: isImage(ext) ? URL.createObjectURL(file) : undefined,
      rawFile: file
    }
    pendingFiles.value.push(pendingFile)
    ElMessage.success('已添加，保存后将上传')
  }

  target.value = ''
}

// 预览
const handlePreview = async (file: PendingFile, _index: number) => {
  // 待上传的图片使用本地URL
  if (!file.id && file.localUrl) {
    previewImageUrl.value = file.localUrl
    imagePreviewVisible.value = true
    return
  }

  // 待上传的文本文件
  if (!file.id && file.rawFile) {
    try {
      textPreviewContent.value = await file.rawFile.text()
      textPreviewVisible.value = true
    } catch (error) {
      ElMessage.error('预览失败')
    }
    return
  }

  // 已上传的文件
  if (!file.id) return

  try {
    const res = await getAttachmentPreview(file.id)
    if (res.data.type === 'image') {
      previewImageUrl.value = res.data.url || ''
      imagePreviewVisible.value = true
    } else {
      textPreviewContent.value = res.data.content || ''
      textPreviewVisible.value = true
    }
  } catch (error) {
    ElMessage.error('预览失败')
  }
}

// 下载
const handleDownload = (file: SysAttachment) => {
  if (!file.id) return
  window.open(getDownloadUrl(file.id), '_blank')
}

// 删除
const handleDelete = async (index: number) => {
  const uploadedCount = fileList.value.length

  if (index < uploadedCount) {
    // 删除已上传的文件
    const file = fileList.value[index]
    if (!file || !file.id) return
    try {
      await deleteAttachment(file.id)
      fileList.value.splice(index, 1)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  } else {
    // 删除待上传的文件
    const pendingIndex = index - uploadedCount
    pendingFiles.value.splice(pendingIndex, 1)
  }
}

// 加载附件列表
const loadAttachments = async () => {
  // 清空待上传列表
  pendingFiles.value = []

  if (!props.targetId) {
    fileList.value = []
    return
  }

  try {
    const res = await getAttachmentList(props.targetType, props.targetId, attachmentType.value)
    fileList.value = res.data || []
  } catch (error) {
    fileList.value = []
  }
}

// 上传待上传的文件
const uploadPendingFiles = async (targetId: string): Promise<boolean> => {
  if (pendingFiles.value.length === 0) return true

  let allSuccess = true
  const filesToUpload = [...pendingFiles.value]
  pendingFiles.value = []

  for (const pendingFile of filesToUpload) {
    if (!pendingFile.rawFile) continue

    try {
      const res = await uploadAttachment(pendingFile.rawFile, props.targetType, targetId, attachmentType.value)
      fileList.value.push(res.data)
    } catch (error) {
      allSuccess = false
      ElMessage.error(`${pendingFile.fileName} 上传失败`)
    }
  }

  return allSuccess
}

// 暴露方法给父组件
defineExpose({
  loadAttachments,
  uploadPendingFiles,
  getFileList: () => fileList.value,
  getPendingFiles: () => pendingFiles.value
})

// 监听 targetId 变化
watch(() => props.targetId, (newVal) => {
  if (newVal) {
    loadAttachments()
  } else {
    fileList.value = []
    pendingFiles.value = []
  }
})

onMounted(() => {
  if (props.targetId) {
    loadAttachments()
  }
})
</script>

<style scoped>
.attachment-upload {
  margin-bottom: 16px;
}

.attachment-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  min-width: 250px;
  max-width: 350px;
}

.attachment-preview {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-preview {
  background: #f0f2f5;
  flex-direction: column;
}

.file-ext {
  font-size: 10px;
  color: #909399;
}

.attachment-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-pending {
  font-size: 11px;
  color: #e6a23c;
}

.attachment-actions {
  display: flex;
  flex-shrink: 0;
}

.upload-btn {
  cursor: pointer;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  color: #909399;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.text-preview-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}
</style>
