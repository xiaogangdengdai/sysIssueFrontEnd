import request from '@/utils/request'
import type { LogQuery, SysLog, PageResult } from '@/types'

// 分页查询日志
export function getLogPage(params: LogQuery): Promise<PageResult<SysLog>> {
  return request.get('/log/page', { params })
}

// 根据ID查询日志
export function getLogById(id: number): Promise<SysLog> {
  return request.get(`/log/${id}`)
}

// 新增日志
export function addLog(data: SysLog): Promise<{ data: SysLog }> {
  return request.post('/log', data)
}

// 更新日志
export function updateLog(data: SysLog): Promise<void> {
  return request.put('/log', data)
}

// 删除日志
export function deleteLog(id: number): Promise<void> {
  return request.delete(`/log/${id}`)
}

// 批量删除日志
export function batchDeleteLog(ids: number[]): Promise<void> {
  return request.delete('/log/batch', { data: ids })
}
