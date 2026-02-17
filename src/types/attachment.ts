export interface SysAttachment {
  id?: number
  targetType?: string
  targetId?: string
  fileName: string
  filePath?: string
  fileSize?: number
  fileType?: string
  fileExt?: string
  sortOrder?: number
  creator?: string
  createTime?: string
  deleted?: number
}

export interface AttachmentPreview {
  fileName: string
  fileExt: string
  fileType: string
  type: 'image' | 'text'
  url?: string
  content?: string
}
