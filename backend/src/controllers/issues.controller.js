const { z } = require('zod');
const prisma = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { requireProjectMember } = require('../services/projectAccess');
const { nextIssueKey } = require('../utils/generateIssueKey');

const ISSUE_TYPES = ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const createIssueSchema = z.object({
  type: z.enum(ISSUE_TYPES),
  title: z.string().min(1),
  description: z.string().optional(),
  statusId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(PRIORITIES).default('MEDIUM'),
  epicId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  storyPoints: z.number().int().min(0).optional(),
});

const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  statusId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
  epicId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  storyPoints: z.number().int().min(0).nullable().optional(),
});

const issueInclude = {
  status: true,
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
  epic: { select: { id: true, key: true, title: true } },
  parent: { select: { id: true, key: true, title: true } },
  _count: { select: { subtasks: true, comments: true } },
};

async function list(req, res) {
  const { project } = await requireProjectMember(req.params.id, req.user.id, req.user.role);

  const where = { projectId: project.id };
  if (req.query.type) where.type = req.query.type;
  if (req.query.statusId) where.statusId = req.query.statusId;
  if (req.query.assigneeId) where.assigneeId = req.query.assigneeId;
  if (req.query.epicId) where.epicId = req.query.epicId;

  const issues = await prisma.issue.findMany({
    where,
    include: issueInclude,
    orderBy: { createdAt: 'asc' },
  });
  res.json({ issues });
}

async function create(req, res) {
  const data = createIssueSchema.parse(req.body);
  const { project } = await requireProjectMember(req.params.id, req.user.id, req.user.role);

  if (data.epicId && data.type === 'SUBTASK') {
    throw new HttpError(400, 'Subtasks link via parentId, not epicId');
  }
  if (data.parentId && data.type !== 'SUBTASK') {
    throw new HttpError(400, 'Only subtasks can have a parentId');
  }

  if (data.epicId) {
    const epic = await prisma.issue.findUnique({ where: { id: data.epicId } });
    if (!epic || epic.projectId !== project.id || epic.type !== 'EPIC') {
      throw new HttpError(400, 'epicId must reference an Epic in the same project');
    }
  }

  if (data.parentId) {
    const parent = await prisma.issue.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.projectId !== project.id || parent.type === 'SUBTASK') {
      throw new HttpError(400, 'parentId must reference a non-subtask issue in the same project');
    }
  }

  let statusId = data.statusId;
  if (statusId) {
    const status = await prisma.status.findUnique({ where: { id: statusId } });
    if (!status || status.projectId !== project.id) {
      throw new HttpError(400, 'statusId must belong to this project');
    }
  } else {
    const defaultStatus = await prisma.status.findFirst({
      where: { projectId: project.id },
      orderBy: { order: 'asc' },
    });
    if (!defaultStatus) {
      throw new HttpError(500, 'Project has no statuses configured');
    }
    statusId = defaultStatus.id;
  }

  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId: data.assigneeId } },
    });
    if (!isMember) {
      throw new HttpError(400, 'assigneeId must be a member of this project');
    }
  }

  const issue = await prisma.$transaction(async (tx) => {
    const key = await nextIssueKey(tx, project);
    return tx.issue.create({
      data: {
        projectId: project.id,
        key,
        type: data.type,
        title: data.title,
        description: data.description,
        statusId,
        assigneeId: data.assigneeId,
        reporterId: req.user.id,
        priority: data.priority,
        epicId: data.epicId,
        parentId: data.parentId,
        storyPoints: data.storyPoints,
      },
      include: issueInclude,
    });
  });

  res.status(201).json({ issue });
}

async function getById(req, res) {
  const issue = await prisma.issue.findUnique({
    where: { id: req.params.id },
    include: { ...issueInclude, subtasks: { select: { id: true, key: true, title: true, statusId: true } } },
  });
  if (!issue) {
    throw new HttpError(404, 'Issue not found');
  }
  await requireProjectMember(issue.projectId, req.user.id, req.user.role);
  res.json({ issue });
}

async function update(req, res) {
  const data = updateIssueSchema.parse(req.body);

  const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new HttpError(404, 'Issue not found');
  }
  const { project } = await requireProjectMember(existing.projectId, req.user.id, req.user.role);

  if (data.statusId) {
    const status = await prisma.status.findUnique({ where: { id: data.statusId } });
    if (!status || status.projectId !== project.id) {
      throw new HttpError(400, 'statusId must belong to this project');
    }
  }

  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId: data.assigneeId } },
    });
    if (!isMember) {
      throw new HttpError(400, 'assigneeId must be a member of this project');
    }
  }

  const issue = await prisma.issue.update({
    where: { id: existing.id },
    data,
    include: issueInclude,
  });
  res.json({ issue });
}

async function remove(req, res) {
  const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new HttpError(404, 'Issue not found');
  }
  await requireProjectMember(existing.projectId, req.user.id, req.user.role);

  await prisma.issue.delete({ where: { id: existing.id } });
  res.status(204).send();
}

module.exports = { list, create, getById, update, remove };
