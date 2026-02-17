import request from '@/utils/request'
import type { SysAttachment, AttachmentPreview } from '@/types/attachment'

export function uploadAttachment(
  file: File,
  targetType: string,
  targetId: string
): Promise<{ data: SysAttachment }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetType', targetType)
  formData.append('targetId', targetId)
  return request.post('/attachment/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getAttachmentList(
  targetType: string,
  targetId: string
): Promise<{ data: SysAttachment[] }> {
  return request.get('/attachment/list', {
    params: { targetType, targetId }
  })
}

export function getAttachmentPreview(id: number): Promise<{ data: AttachmentPreview }> {
  return request.get(`/attachment/preview/${id}`)
}

export function getDownloadUrl(id: number): string {
  return `/api/attachment/download/${id}`
}

export function deleteAttachment(id: number): Promise<void> {
  return request.delete(`/attachment/${id}`)
}
