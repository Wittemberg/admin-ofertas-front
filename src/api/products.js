import api from './axios'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const getProductEnrichments = (params) => api.get('/products/enrichments/review', { params })
export const suggestProductEnrichment = (id) => api.post(`/products/${id}/enrichment/suggest`)
export const webSearchProductEnrichment = (id) => api.post(`/products/${id}/enrichment/web-search`)
export const createManualProductEnrichment = (id, data) => api.post(`/products/${id}/enrichment/manual`, data)
export const updateProductEnrichment = (id, data) => api.put(`/products/enrichments/${id}`, data)
export const approveProductEnrichment = (id) => api.post(`/products/enrichments/${id}/approve`)
export const rejectProductEnrichment = (id, data) => api.post(`/products/enrichments/${id}/reject`, data)
export const uploadProductImage = async (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/upload/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
