import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Demo user ID (from seed data)
export const DEMO_USER_ID = '897e80d3-cd9e-41e7-ae71-f681164cc427';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fields API
export const fieldsApi = {
    getAll: (userId: string) => api.get(`/fields?userId=${userId}`),
    getById: (id: string) => api.get(`/fields/${id}`),
    create: (data: any) => api.post('/fields', data),
    update: (id: string, data: any) => api.put(`/fields/${id}`, data),
    delete: (id: string) => api.delete(`/fields/${id}`),
};

// Plant Batches API
export const plantBatchesApi = {
    getAll: (params?: any) => api.get('/plant-batches', { params }),
    getById: (id: string) => api.get(`/plant-batches/${id}`),
    create: (data: any) => api.post('/plant-batches', data),
    update: (id: string, data: any) => api.put(`/plant-batches/${id}`, data),
    updateStatus: (id: string, data: any) => api.put(`/plant-batches/${id}/status`, data),
    delete: (id: string) => api.delete(`/plant-batches/${id}`),
};

// Irrigation API
export const irrigationApi = {
    getEvents: (plantBatchId: string) => api.get(`/irrigation?plantBatchId=${plantBatchId}`),
    getOverdue: (userId: string) => api.get(`/irrigation/overdue?userId=${userId}`),
    create: (data: any) => api.post('/irrigation', data),
    complete: (id: string, data: any) => api.put(`/irrigation/${id}/complete`, data),
};

// Notes API
export const notesApi = {
    getAll: (params?: any) => api.get('/notes', { params }),
    create: (data: any) => api.post('/notes', data),
    update: (id: string, data: any) => api.put(`/notes/${id}`, data),
    delete: (id: string) => api.delete(`/notes/${id}`),
};

// Dashboard API
export const dashboardApi = {
    getStats: (userId: string) => api.get(`/dashboard/stats?userId=${userId}`),
    getAlerts: (userId: string) => api.get(`/dashboard/alerts?userId=${userId}`),
};

export default api;
