const { Router } = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const issuesController = require('../controllers/issues.controller');
const commentsController = require('../controllers/comments.controller');

const router = Router();

router.use(requireAuth);

router.get('/:id', asyncHandler(issuesController.getById));
router.patch('/:id', asyncHandler(issuesController.update));
router.delete('/:id', asyncHandler(issuesController.remove));

router.get('/:id/comments', asyncHandler(commentsController.list));
router.post('/:id/comments', asyncHandler(commentsController.create));

module.exports = router;
