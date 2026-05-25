import axios from './axios'

export const getTenantSettings = () => {
  return axios.get('/tenant/settings')
}

export const updateTenantSettings = (data) => {
  return axios.put('/tenant/settings', data)
}

export const uploadTenantLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/tenant/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Branding automático (fluxo síncrono, sem jobs)
export const uploadTenantBranding = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/tenant/branding', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}