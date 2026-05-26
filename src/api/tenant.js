import axios from './axios'

export const getTenantSettings = () => {
  return axios.get('/auth/tenant/settings')
}

export const updateTenantSettings = (data) => {
  return axios.put('/auth/tenant/settings', data)
}

export const uploadTenantLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/auth/tenant/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Branding automático (fluxo síncrono, sem jobs)
export const uploadTenantBranding = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/auth/tenant/branding', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
