const express = require('express');
const router = express.Router();
const uaePassController = require('../controllers/uaePassController');

router.get('/login', uaePassController.initiateLogin);
router.get('/callback', uaePassController.handleCallback);
router.post('/logout', uaePassController.logout);

module.exports = router;
