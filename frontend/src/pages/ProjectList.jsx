import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createProject, listProjects } from '../api/projects';

export default function ProjectList() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: listProjects });

  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const createMutation = useMutation({
    mutationFn: () => createProject({ key: key.toUpperCase(), name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setKey('');
      setName('');
      setError(null);
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to create project'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New project
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Key</label>
            <input
              required
              maxLength={10}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ENG"
              className="w-28 rounded border border-gray-300 px-3 py-2 uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Engineering"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : projects?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-lg bg-white p-4 shadow transition hover:shadow-md"
            >
              <div className="mb-1 text-xs font-semibold uppercase text-blue-600">{project.key}</div>
              <div className="font-medium text-gray-900">{project.name}</div>
              {project.description && <p className="mt-1 text-sm text-gray-500">{project.description}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No projects yet. Create one to get started.</p>
      )}
    </div>
  );
}
