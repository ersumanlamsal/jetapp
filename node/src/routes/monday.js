const router = require('express').Router();
const { authenticationMiddleware } = require('../middlewares/authentication');
const mondayController = require('../controllers/monday-controller');

//listen webhook on changing column

router.post('/monday/duplicate_action', authenticationMiddleware, mondayController.executeAction);

module.exports = router;
