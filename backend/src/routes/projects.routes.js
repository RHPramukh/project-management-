const { Router } = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const projectsController = require('../controllers/projects.controller');
const statusesController = require('../controllers/statuses.controller');
const issuesController = require('../controllers/issues.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(projectsController.list));
router.post('/', asyncHandler(projectsController.create));
router.get('/:id', asyncHandler(projectsController.getById));
router.patch('/:id', asyncHandler(projectsController.update));
router.delete('/:id', asyncHandler(projectsController.remove));
router.post('/:id/members', asyncHandler(projectsController.addMember));
router.delete('/:id/members/:userId', asyncHandler(projectsController.removeMember));

router.get('/:id/statuses', asyncHandler(statusesController.list));

router.get('/:id/issues', asyncHandler(issuesController.list));
router.post('/:id/issues', asyncHandler(issuesController.create));

module.exports = router;
