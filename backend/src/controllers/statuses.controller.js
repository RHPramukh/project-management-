const prisma = require('../config/db');
const { requireProjectMember } = require('../services/projectAccess');

async function list(req, res) {
  const { project } = await requireProjectMember(req.params.id, req.user.id, req.user.role);
  const statuses = await prisma.status.findMany({
    where: { projectId: project.id },
    orderBy: { order: 'asc' },
  });
  res.json({ statuses });
}

module.exports = { list };
