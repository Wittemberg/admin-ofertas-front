import api from './axios'

export const getConfigs = () => api.get('/admin/config')

export const getConfigsByCategory = (category) => api.get(`/admin/config/${category}`)

export const updateConfig = (category, key, data) =>
  api.put(`/admin/config/${category}/${key}`, data)

export const createConfig = (data) => api.post('/admin/config', data)

export const deleteConfig = (category, key) =>
  api.delete(`/admin/config/${category}/${key}`)

export const reloadCache = () => api.post('/admin/config/reload')

export const getAuditLogs = (params) => api.get('/admin/audit', { params })

export const getTenants = () => api.get('/admin/tenants')

export const createTenant = (data) => api.post('/admin/tenants', data)
