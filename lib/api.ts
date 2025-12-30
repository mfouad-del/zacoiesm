const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get token
const getToken = () => localStorage.getItem('sb-access-token');

// Helper for headers
const getHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Generic Fetcher
async function fetchResource(resource: string) {
    const response = await fetch(`${API_URL}/${resource}`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch ${resource}`);
    return response.json();
}

async function createResource(resource: string, data: any) {
    const response = await fetch(`${API_URL}/${resource}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create ${resource}`);
    return response.json();
}

async function updateResource(resource: string, id: string, data: any) {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update ${resource}`);
    return response.json();
}

async function deleteResource(resource: string, id: string) {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Failed to delete ${resource}`);
    return response.json();
}

export async function fetchProjects() {
  const response = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function fetchContracts() {
  const response = await fetch(`${API_URL}/contracts`, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error('Failed to fetch contracts');
  }
  return response.json();
}

export const fetchVariations = () => fetchResource('variations');
export const fetchPlanning = () => fetchResource('planning');
export const fetchQuality = () => fetchResource('quality'); // NCRs
export const fetchSafety = () => fetchResource('safety'); // Incidents
export const fetchDocuments = () => fetchResource('documents');
export const fetchTimesheets = () => fetchResource('timesheets');
export const fetchReports = () => fetchResource('reports');
export const fetchResources = () => fetchResource('resources');
export const fetchEquipment = () => fetchResource('equipment');
export const fetchSites = () => fetchResource('sites');

// API Object for cleaner usage
export const api = {
    projects: {
        list: fetchProjects,
        create: (data: any) => createResource('projects', data),
        update: (id: string, data: any) => updateResource('projects', id, data),
        delete: (id: string) => deleteResource('projects', id)
    },
    contracts: {
        list: fetchContracts,
        create: (data: any) => createResource('contracts', data),
        update: (id: string, data: any) => updateResource('contracts', id, data),
        delete: (id: string) => deleteResource('contracts', id)
    },
    variations: {
        list: fetchVariations,
        create: (data: any) => createResource('variations', data),
        update: (id: string, data: any) => updateResource('variations', id, data),
        delete: (id: string) => deleteResource('variations', id)
    },
    planning: {
        list: fetchPlanning,
        create: (data: any) => createResource('planning', data),
        update: (id: string, data: any) => updateResource('planning', id, data),
        delete: (id: string) => deleteResource('planning', id)
    },
    quality: {
        list: fetchQuality,
        create: (data: any) => createResource('quality', data),
        update: (id: string, data: any) => updateResource('quality', id, data),
        delete: (id: string) => deleteResource('quality', id)
    },
    safety: {
        list: fetchSafety,
        create: (data: any) => createResource('safety', data),
        update: (id: string, data: any) => updateResource('safety', id, data),
        delete: (id: string) => deleteResource('safety', id)
    },
    documents: {
        list: fetchDocuments,
        create: (data: any) => createResource('documents', data),
        update: (id: string, data: any) => updateResource('documents', id, data),
        delete: (id: string) => deleteResource('documents', id)
    },
    timesheets: {
        list: fetchTimesheets,
        create: (data: any) => createResource('timesheets', data),
        update: (id: string, data: any) => updateResource('timesheets', id, data),
        delete: (id: string) => deleteResource('timesheets', id)
    },
    reports: {
        list: fetchReports,
        create: (data: any) => createResource('reports', data),
        update: (id: string, data: any) => updateResource('reports', id, data),
        delete: (id: string) => deleteResource('reports', id)
    },
    resources: {
        list: fetchResources,
        create: (data: any) => createResource('resources', data),
        update: (id: string, data: any) => updateResource('resources', id, data),
        delete: (id: string) => deleteResource('resources', id)
    },
    equipment: {
        list: fetchEquipment,
        create: (data: any) => createResource('equipment', data),
        update: (id: string, data: any) => updateResource('equipment', id, data),
        delete: (id: string) => deleteResource('equipment', id)
    },
    sites: {
        list: fetchSites,
        create: (data: any) => createResource('sites', data),
        update: (id: string, data: any) => updateResource('sites', id, data),
        delete: (id: string) => deleteResource('sites', id)
    }
};

// --- User Management ---

export async function seedAdmin() {
    const response = await fetch(`${API_URL}/seed-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to seed admin');
    return response.json();
}

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export async function createUser(userData: any) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
}

export async function updateUser(id: string, userData: any) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
    }
    return response.json();
}

export async function deleteUser(id: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
}

export async function changePassword(password: string) {
    const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
    }
    return response.json();
}

