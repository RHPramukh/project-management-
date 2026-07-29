const { Router } = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const commentsController = require('../controllers/comments.controller');

const router = Router();

router.use(requireAuth);

router.delete('/:commentId', asyncHandler(commentsController.remove));

module.exports = router;
