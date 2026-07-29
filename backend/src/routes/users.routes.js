const { Router } = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

const router = Router();

router.get('/', requireAuth, asyncHandler(usersController.list));

module.exports = router;
