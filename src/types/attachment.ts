export interface SysAttachment {
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
}

export interface AttachmentPreview {
  fileName: string
  fileExt: string
  fileType: string
  type: 'image' | 'text'
  url?: string
  content?: string
}
