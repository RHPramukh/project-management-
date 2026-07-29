const { z } = require('zod');
const prisma = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'SUPER_ADMIN']),
});

async function list(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    orderBy: { name: 'asc' },
  });
  res.json({ users });
}

async function updateRole(req, res) {
  const data = updateRoleSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: data.role },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true },
  });
  res.json({ user: updated });
}

module.exports = { list, updateRole };
