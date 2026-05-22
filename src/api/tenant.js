import axios from './axios'

export const getTenantSettings = () => axios.get('/auth/tenant/settings')

export const updateTenantSettings = (data) => axios.put('/auth/tenant/settings', data)

export const uploadTenantLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post('/auth/tenant/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Branding automático com IA
export const uploadTenantBranding = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post('/auth/tenant/branding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getBrandingStatus = (jobId) =>
  axios.get(`/auth/tenant/branding/status/${jobId}`)