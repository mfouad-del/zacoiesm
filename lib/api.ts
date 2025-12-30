const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchProjects() {
  const response = await fetch(`${API_URL}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function fetchContracts() {
  const response = await fetch(`${API_URL}/contracts`);
  if (!response.ok) {
    throw new Error('Failed to fetch contracts');
  }
  return response.json();
}
