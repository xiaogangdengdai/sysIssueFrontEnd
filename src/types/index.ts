// 系统日志类型
export interface SysLog {
  id?: number
  logType: string
  title: string
  content?: string
  operator?: string
  ipAddress?: string
  requestMethod?: string
  requestUrl?: string
  requestParams?: string
  responseResult?: string
  executeTime?: number
  status?: number
  errorMsg?: string
  createTime?: string
  updateTime?: string
  deleted?: number
}

// 查询条件
export interface LogQuery {
  pageNum: number
  pageSize: number
  logType?: string
  title?: string
  operator?: string
  status?: number
  startTime?: string
  endTime?: string
}

// 分页结果
export interface PageResult<T> {
  code: number
  message: string
  data: {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
  }
  total: number
}

// 日志类型选项
export const LOG_TYPES = [
  { label: '信息', value: 'INFO' },
  { label: '警告', value: 'WARN' },
  { label: '错误', value: 'ERROR' }
]

// 状态选项
export const STATUS_OPTIONS = [
  { label: '成功', value: 0 },
  { label: '失败', value: 1 }
]

// ===== 问题日志相关 =====

// 系统问题日志类型
export interface SystemIssueLog {
  id?: string
  type: number
  description?: string
  createTableSql?: string
  newRequirement?: string
  beforeTransformation?: string
  transformation?: string
  businessContext?: string
  remark?: string
  status: number
  creator?: string
  creatorIp?: string
  createdAt?: string
  modifyUser?: string
  modifyIp?: string
  modifyAt?: string
}

// 问题日志查询条件
export interface IssueLogQuery {
  pageNum: number
  pageSize: number
  type?: number
  types?: number[]  // 支持多类型查询
  creator?: string
  status?: number
  startTime?: string
  endTime?: string
}

// 选项类型
export interface SelectOption {
  label: string
  value: number
}

// 类型选项
export const TYPE_OPTIONS: SelectOption[] = [
  { label: 'bug修复', value: 1 },
  { label: '新功能开发', value: 2 },
  { label: '原有功能改造', value: 3 },
  { label: '页面原型快速实现', value: 4 },
  { label: '后台方法深度分析', value: 5 },
  { label: '前端功能模块深度分析', value: 6 },
  { label: '代码Review报告', value: 7 }
]

// 问题状态选项
export const ISSUE_STATUS_OPTIONS: SelectOption[] = [
  { label: '待处理', value: 1 },
  { label: '处理中', value: 2 },
  { label: '已完成', value: 3 },
  { label: '处理失败', value: 4 }
]
