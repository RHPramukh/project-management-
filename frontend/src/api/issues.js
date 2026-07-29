import client from './client';

export const listIssues = (projectId, filters = {}) =>
  client.get(`/projects/${projectId}/issues`, { params: filters }).then((r) => r.data.issues);

export const createIssue = (projectId, data) =>
  client.post(`/projects/${projectId}/issues`, data).then((r) => r.data.issue);

export const getIssue = (id) => client.get(`/issues/${id}`).then((r) => r.data.issue);

export const updateIssue = (id, data) => client.patch(`/issues/${id}`, data).then((r) => r.data.issue);

export const deleteIssue = (id) => client.delete(`/issues/${id}`);
