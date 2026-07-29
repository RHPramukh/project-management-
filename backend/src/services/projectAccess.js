const prisma = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

const SUPER_ADMIN_MEMBERSHIP = { role: 'ADMIN' };

// Throws 404 if the project doesn't exist, 403 if the user isn't a member.
// Super admins bypass the membership check and act as an implicit ADMIN on every project.
// Returns the project record with membership already confirmed.
async function requireProjectMember(projectId, userId, userRole) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  if (userRole === 'SUPER_ADMIN') {
    return { project, membership: SUPER_ADMIN_MEMBERSHIP };
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) {
    throw new HttpError(403, 'You are not a member of this project');
  }

  return { project, membership };
}

async function requireProjectAdmin(projectId, userId, userRole) {
  const { project, membership } = await requireProjectMember(projectId, userId, userRole);
  if (membership.role !== 'ADMIN') {
    throw new HttpError(403, 'Only project admins can perform this action');
  }
  return { project, membership };
}

module.exports = { requireProjectMember, requireProjectAdmin };
