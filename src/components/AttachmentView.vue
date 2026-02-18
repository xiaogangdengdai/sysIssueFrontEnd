<template>
  <div class="attachment-view">
    <div v-if="label" class="attachment-label">{{ label }}</div>

    <!-- Empty state -->
    <div v-if="fileList.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无附件" :image-size="60" />
    </div>

    <!-- Attachment list -->
    <div v-else class="attachment-list">
      <div
        v-for="file in fileList"
        :key="file.id"
        class="attachment-item"
      >
        <!-- Image type -->
        <div v-if="isImage(file.fileExt)" class="attachment-preview image-preview" @click="handlePreview(file)">
          <img :src="getDownloadUrl(file.id!)" alt="preview" />
        </div>

        <!-- Text file type -->
        <div v-else class="attachment-preview file-preview" @click="handlePreview(file)">
          <el-icon size="32"><Document /></el-icon>
          <span class="file-ext">{{ file.fileExt?.toUpperCase() }}</span>
        </div>

        <div class="attachment-info">
          <div class="file-name" :title="file.fileName">{{ file.fileName }}</div>
          <div class="file-size">{{ formatSize(file.fileSize) }}</div>
        </div>

        <div class="attachment-actions">
          <el-button type="primary" link size="small" @click="handlePreview(file)">
            <el-icon><View /></el-icon>
          </el-button>
          <el-button type="primary" link size="small" @click="handleDownload(file)">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- Image preview dialog -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="800px">
      <img :src="previewImageUrl" style="width: 100%" />
    </el-dialog>

    <!-- Text preview dialog -->
    <el-dialog v-model="textPreviewVisible" title="文件预览" width="800px">
      <pre class="text-preview-content">{{ textPreviewContent }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Download, View, Loading } from '@element-plus/icons-vue'
import {
  getAttachmentList,
  getAttachmentPreview,
  getDownloadUrl
} from '@/api/attachment'
import type { SysAttachment } from '@/types/attachment'

const props = defineProps<{
  targetType: string
  targetId: string
  type: number  // 1=user upload, 2=system generated
  label?: string
}>()

const loading = ref(false)
const fileList = ref<SysAttachment[]>([])

const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const textPreviewVisible = ref(false)
const textPreviewContent = ref('')

// Check if file is an image
const isImage = (ext?: string) => {
  if (!ext) return false
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())
}

// Format file size
const formatSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Preview handler
const handlePreview = async (file: SysAttachment) => {
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

// Download handler
const handleDownload = (file: SysAttachment) => {
  if (!file.id) return
  window.open(getDownloadUrl(file.id), '_blank')
}

// Load attachments
const loadAttachments = async () => {
  if (!props.targetId) {
    fileList.value = []
    return
  }

  loading.value = true
  try {
    const res = await getAttachmentList(props.targetType, props.targetId, props.type)
    fileList.value = res.data || []
  } catch (error) {
    fileList.value = []
    ElMessage.error('加载附件失败')
  } finally {
    loading.value = false
  }
}

// Expose method to parent component
defineExpose({
  loadAttachments,
  getFileList: () => fileList.value
})

// Watch targetId changes
watch(() => props.targetId, (newVal) => {
  if (newVal) {
    loadAttachments()
  } else {
    fileList.value = []
  }
})

// Watch type changes
watch(() => props.type, () => {
  if (props.targetId) {
    loadAttachments()
  }
})

onMounted(() => {
  if (props.targetId) {
    loadAttachments()
  }
})
</script>

<style scoped>
.attachment-view {
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

.attachment-actions {
  display: flex;
  flex-shrink: 0;
}

.empty-state {
  padding: 20px;
  text-align: center;
  background: #fafafa;
  border-radius: 4px;
  border: 1px dashed #dcdfe6;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
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
