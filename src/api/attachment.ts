import request from '@/utils/request'
import type { SysAttachment, AttachmentPreview } from '@/types/attachment'

/**
 * Upload a file attachment
 * @param file - The file to upload
 * @param targetType - The type of the target entity (e.g., 'issue', 'comment')
 * @param targetId - The ID of the target entity
 * @param type - The attachment type (default: 1). 1=general attachment, 2=screenshot, etc.
 * @returns Promise with the uploaded attachment data
 */
export function uploadAttachment(
  file: File,
  targetType: string,
  targetId: string,
  type: number = 1
): Promise<{ data: SysAttachment }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetType', targetType)
  formData.append('targetId', targetId)
  formData.append('type', type.toString())
  return request.post('/attachment/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * Get list of attachments for a target entity
 * @param targetType - The type of the target entity (e.g., 'issue', 'comment')
 * @param targetId - The ID of the target entity
 * @param type - Optional attachment type filter (1=general attachment, 2=screenshot, etc.)
 * @returns Promise with array of attachments
 */
export function getAttachmentList(
  targetType: string,
  targetId: string,
  type?: number
): Promise<{ data: SysAttachment[] }> {
  return request.get('/attachment/list', {
    params: { targetType, targetId, type }
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
