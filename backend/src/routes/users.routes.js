const { Router } = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

const router = Router();

router.get('/', requireAuth, asyncHandler(usersController.list));
router.patch('/:id/role', requireAuth, requireSuperAdmin, asyncHandler(usersController.updateRole));

module.exports = router;
