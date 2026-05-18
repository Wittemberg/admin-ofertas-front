import api from './axios'

export const getTenantSettings = () => api.get('/auth/tenant/settings')
export const updateTenantSettings = (data) => api.put('/auth/tenant/settings', data)
export const uploadTenantLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/auth/tenant/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}