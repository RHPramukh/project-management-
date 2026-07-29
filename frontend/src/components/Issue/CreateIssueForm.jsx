import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssue } from '../../api/issues';

const TYPES = ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function CreateIssueForm({ projectId, users, issues, onClose }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState('TASK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [epicId, setEpicId] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState(null);

  const epics = issues.filter((i) => i.type === 'EPIC');
  const nonSubtasks = issues.filter((i) => i.type !== 'SUBTASK');

  const mutation = useMutation({
    mutationFn: () =>
      createIssue(projectId, {
        type,
        title,
        description: description || undefined,
        assigneeId: assigneeId || undefined,
        priority,
        epicId: type !== 'SUBTASK' && epicId ? epicId : undefined,
        parentId: type === 'SUBTASK' && parentId ? parentId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to create issue'),
  });

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Create issue</h2>
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="flex gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {type !== 'SUBTASK' && type !== 'EPIC' && epics.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Epic</label>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">None</option>
                {epics.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.key} — {e.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'SUBTASK' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Parent issue</label>
              <select
                required
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">Select parent…</option>
                {nonSubtasks.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.key} — {i.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
