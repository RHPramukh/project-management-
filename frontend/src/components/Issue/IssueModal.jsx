import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteIssue, getIssue, updateIssue } from '../../api/issues';
import CommentList from './CommentList';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function IssueModal({ issueId, projectId, statuses, users, onClose }) {
  const queryClient = useQueryClient();
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => getIssue(issueId),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description || '');
    }
  }, [issue]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
    queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
  }

  const updateMutation = useMutation({
    mutationFn: (data) => updateIssue(issueId, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
      onClose();
    },
  });

  if (isLoading || !issue) {
    return (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
        <div className="rounded-lg bg-white p-6 shadow-xl">Loading…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="text-xs font-semibold uppercase text-gray-400">
            {issue.type} · {issue.key}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Delete this issue?')) deleteMutation.mutate();
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== issue.title && updateMutation.mutate({ title })}
          className="mb-4 w-full border-b border-transparent text-xl font-semibold text-gray-900 hover:border-gray-200 focus:border-blue-500 focus:outline-none"
        />

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
            <select
              value={issue.statusId}
              onChange={(e) => updateMutation.mutate({ statusId: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Assignee</label>
            <select
              value={issue.assigneeId || ''}
              onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value || null })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Priority</label>
            <select
              value={issue.priority}
              onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (issue.description || '') && updateMutation.mutate({ description })}
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {issue.subtasks?.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Subtasks</h3>
            <ul className="space-y-1">
              {issue.subtasks.map((st) => (
                <li key={st.id} className="text-sm text-gray-600">
                  {st.key} — {st.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr className="mb-4" />
        <CommentList issueId={issueId} />
      </div>
    </div>
  );
}
