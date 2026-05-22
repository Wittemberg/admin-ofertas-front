import axios from './axios';

export const getTenantSettings = () => {
  return axios.get('/auth/tenant/settings');
};

export const updateTenantSettings = (data) => {
  return axios.put('/auth/tenant/settings', data);
};

export const uploadTenantLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post('/auth/tenant/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadTenantBranding = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/auth/tenant/branding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getBrandingStatus = (jobId) => {
  return axios.get(`/auth/tenant/branding/status/${jobId}`);
};