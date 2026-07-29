import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import { getProject, listStatuses, listUsers } from '../api/projects';
import { listIssues, updateIssue } from '../api/issues';
import BoardColumn from '../components/Board/BoardColumn';
import CreateIssueForm from '../components/Issue/CreateIssueForm';
import IssueModal from '../components/Issue/IssueModal';

export default function ProjectBoard() {
  const { id: projectId } = useParams();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(null);

  const { data: project } = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId) });
  const { data: statuses } = useQuery({ queryKey: ['statuses', projectId], queryFn: () => listStatuses(projectId) });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const { data: issues } = useQuery({ queryKey: ['issues', projectId], queryFn: () => listIssues(projectId) });

  const moveMutation = useMutation({
    mutationFn: ({ issueId, statusId }) => updateIssue(issueId, { statusId }),
    onMutate: async ({ issueId, statusId }) => {
      await queryClient.cancelQueries({ queryKey: ['issues', projectId] });
      const previous = queryClient.getQueryData(['issues', projectId]);
      queryClient.setQueryData(['issues', projectId], (old) =>
        old.map((i) => (i.id === issueId ? { ...i, statusId } : i))
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) queryClient.setQueryData(['issues', projectId], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['issues', projectId] }),
  });

  function handleDragEnd(result) {
    const { destination, draggableId } = result;
    if (!destination) return;
    moveMutation.mutate({ issueId: draggableId, statusId: destination.droppableId });
  }

  if (!project || !statuses || !users || !issues) {
    return <p className="text-gray-500">Loading board…</p>;
  }

  const boardIssues = issues.filter((i) => i.type !== 'SUBTASK');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-blue-600">{project.key}</div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create issue
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <BoardColumn
              key={status.id}
              status={status}
              issues={boardIssues.filter((i) => i.statusId === status.id)}
              onIssueClick={setActiveIssueId}
            />
          ))}
        </div>
      </DragDropContext>

      {showCreate && (
        <CreateIssueForm projectId={projectId} users={users} issues={issues} onClose={() => setShowCreate(false)} />
      )}

      {activeIssueId && (
        <IssueModal
          issueId={activeIssueId}
          projectId={projectId}
          statuses={statuses}
          users={users}
          onClose={() => setActiveIssueId(null)}
        />
      )}
    </div>
  );
}
