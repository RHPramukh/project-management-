import client from './client';

export const listComments = (issueId) => client.get(`/issues/${issueId}/comments`).then((r) => r.data.comments);
export const createComment = (issueId, body) =>
  client.post(`/issues/${issueId}/comments`, { body }).then((r) => r.data.comment);
export const deleteComment = (commentId) => client.delete(`/comments/${commentId}`);
