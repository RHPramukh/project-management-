import { Draggable } from '@hello-pangea/dnd';

const TYPE_COLORS = {
  EPIC: 'bg-purple-100 text-purple-700',
  STORY: 'bg-green-100 text-green-700',
  TASK: 'bg-blue-100 text-blue-700',
  BUG: 'bg-red-100 text-red-700',
  SUBTASK: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLORS = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-600',
};

export default function IssueCard({ issue, index, onClick }) {
  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`mb-2 cursor-pointer rounded-md border border-gray-200 bg-white p-3 shadow-sm hover:shadow ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[issue.type]}`}>
              {issue.type}
            </span>
            <span className="text-xs text-gray-400">{issue.key}</span>
          </div>
          <p className="mb-2 text-sm font-medium text-gray-800">{issue.title}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${PRIORITY_COLORS[issue.priority]}`}>{issue.priority}</span>
            {issue.assignee && (
              <span
                title={issue.assignee.name}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white"
              >
                {issue.assignee.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
