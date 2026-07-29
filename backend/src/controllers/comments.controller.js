const { z } = require('zod');
const prisma = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { requireProjectMember } = require('../services/projectAccess');

const createCommentSchema = z.object({
  body: z.string().min(1),
});

const commentInclude = {
  author: { select: { id: true, name: true, email: true, avatarUrl: true } },
};

async function getIssueForUser(issueId, userId, userRole) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    throw new HttpError(404, 'Issue not found');
  }
  await requireProjectMember(issue.projectId, userId, userRole);
  return issue;
}

async function list(req, res) {
  const issue = await getIssueForUser(req.params.id, req.user.id, req.user.role);
  const comments = await prisma.comment.findMany({
    where: { issueId: issue.id },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
  res.json({ comments });
}

async function create(req, res) {
  const data = createCommentSchema.parse(req.body);
  const issue = await getIssueForUser(req.params.id, req.user.id, req.user.role);

  const comment = await prisma.comment.create({
    data: { issueId: issue.id, authorId: req.user.id, body: data.body },
    include: commentInclude,
  });
  res.status(201).json({ comment });
}

async function remove(req, res) {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
  if (!comment) {
    throw new HttpError(404, 'Comment not found');
  }
  if (comment.authorId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    throw new HttpError(403, 'You can only delete your own comments');
  }
  await prisma.comment.delete({ where: { id: comment.id } });
  res.status(204).send();
}

module.exports = { list, create, remove };
