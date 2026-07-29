import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, listComments } from '../../api/comments';

export default function CommentList({ issueId }) {
  const queryClient = useQueryClient();
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => listComments(issueId),
  });
  const [body, setBody] = useState('');

  const mutation = useMutation({
    mutationFn: () => createComment(issueId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      setBody('');
    },
  });

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Comments</h3>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="mb-3 space-y-3">
          {comments?.map((c) => (
            <div key={c.id} className="rounded bg-gray-50 p-2">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{c.author.name}</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-800">{c.body}</p>
            </div>
          ))}
          {comments?.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) mutation.mutate();
        }}
        className="flex gap-2"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}
