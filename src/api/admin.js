import api from './axios'

export const getConfigs = () => api.get('/admin/config')

export const getConfigsByCategory = (category) => api.get(`/admin/config/${category}`)

export const updateConfig = (category, key, data) =>
  api.put(`/admin/config/${category}/${key}`, data)

export const createConfig = (data) => api.post('/admin/config', data)

export const deleteConfig = (category, key) =>
  api.delete(`/admin/config/${category}/${key}`)

export const reloadCache = () => api.post('/admin/config/reload')