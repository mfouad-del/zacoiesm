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

