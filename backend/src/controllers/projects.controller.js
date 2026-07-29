const { z } = require('zod');
const prisma = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { requireProjectMember, requireProjectAdmin } = require('../services/projectAccess');
const { DEFAULT_STATUSES } = require('../utils/defaultStatuses');

const createProjectSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, 'Key must be uppercase letters/numbers, starting with a letter'),
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

async function list(req, res) {
  const where = req.user.role === 'SUPER_ADMIN' ? {} : { members: { some: { userId: req.user.id } } };
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ projects });
}

async function create(req, res) {
  const data = createProjectSchema.parse(req.body);

  const existing = await prisma.project.findUnique({ where: { key: data.key } });
  if (existing) {
    throw new HttpError(409, `Project key "${data.key}" is already in use`);
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        leadId: req.user.id,
        members: { create: { userId: req.user.id, role: 'ADMIN' } },
        statuses: { create: DEFAULT_STATUSES },
      },
    });
    return created;
  });

  res.status(201).json({ project });
}

async function getById(req, res) {
  const { project } = await requireProjectMember(req.params.id, req.user.id, req.user.role);
  res.json({ project });
}

async function update(req, res) {
  const data = updateProjectSchema.parse(req.body);
  const { project } = await requireProjectAdmin(req.params.id, req.user.id, req.user.role);

  const updated = await prisma.project.update({
    where: { id: project.id },
    data,
  });
  res.json({ project: updated });
}

async function remove(req, res) {
  const { project } = await requireProjectAdmin(req.params.id, req.user.id, req.user.role);
  await prisma.project.delete({ where: { id: project.id } });
  res.status(204).send();
}

async function addMember(req, res) {
  const data = addMemberSchema.parse(req.body);
  const { project } = await requireProjectAdmin(req.params.id, req.user.id, req.user.role);

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: data.userId } },
    create: { projectId: project.id, userId: data.userId, role: data.role },
    update: { role: data.role },
  });

  res.status(201).json({ member });
}

async function removeMember(req, res) {
  const { project } = await requireProjectAdmin(req.params.id, req.user.id, req.user.role);
  const { userId } = req.params;

  if (userId === project.leadId) {
    throw new HttpError(400, 'Cannot remove the project lead');
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: project.id, userId } },
  });
  res.status(204).send();
}

module.exports = { list, create, getById, update, remove, addMember, removeMember };
