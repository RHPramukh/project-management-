import { Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';

export default function BoardColumn({ status, issues, onIssueClick }) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-gray-50">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-700">{status.name}</h3>
        <span className="text-xs text-gray-400">{issues.length}</span>
      </div>
      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] flex-1 px-2 pb-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {issues.map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} onClick={() => onIssueClick(issue.id)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
