const prisma = require('../config/db');

async function list(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, avatarUrl: true },
    orderBy: { name: 'asc' },
  });
  res.json({ users });
}

module.exports = { list };
