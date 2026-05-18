import api from './axios'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const uploadProductImage = async (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/upload/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
