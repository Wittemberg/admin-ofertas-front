import api from './axios'

export const getDashboardMetrics = () => api.get('/dashboard')