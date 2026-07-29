import client from './client';

export const register = (data) => client.post('/auth/register', data).then((r) => r.data);
export const login = (data) => client.post('/auth/login', data).then((r) => r.data);
export const me = () => client.get('/auth/me').then((r) => r.data);
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email }).then((r) => r.data);
export const resetPassword = (token, password) =>
  client.post('/auth/reset-password', { token, password }).then((r) => r.data);
