import request from '@/utils/request'
import type { IssueLogQuery, SystemIssueLog, PageResult } from '@/types'

export function getIssueLogPage(params: IssueLogQuery): Promise<PageResult<SystemIssueLog>> {
  return request.get('/issue-log/page', { params })
}

export function getIssueLogById(id: string): Promise<SystemIssueLog> {
  return request.get(`/issue-log/${id}`)
}

export function addIssueLog(data: SystemIssueLog): Promise<{ data: SystemIssueLog }> {
  return request.post('/issue-log', data)
}

export function updateIssueLog(data: SystemIssueLog): Promise<void> {
  return request.put('/issue-log', data)
}

export function deleteIssueLog(id: string): Promise<void> {
  return request.delete(`/issue-log/${id}`)
}

export function batchDeleteIssueLog(ids: string[]): Promise<void> {
  return request.delete('/issue-log/batch', { data: ids })
}
