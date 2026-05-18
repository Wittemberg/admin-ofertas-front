import api from './axios'

export const getApiKeys = () => api.get('/auth/api-keys')
export const createApiKey = (data) => api.post('/auth/api-keys', data)
export const revokeApiKey = (id) => api.delete(`/auth/api-keys/${id}`)