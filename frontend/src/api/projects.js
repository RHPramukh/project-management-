import client from './client';

export const listProjects = () => client.get('/projects').then((r) => r.data.projects);
export const createProject = (data) => client.post('/projects', data).then((r) => r.data.project);
export const getProject = (id) => client.get(`/projects/${id}`).then((r) => r.data.project);
export const listStatuses = (id) => client.get(`/projects/${id}/statuses`).then((r) => r.data.statuses);
export const listUsers = () => client.get('/users').then((r) => r.data.users);
