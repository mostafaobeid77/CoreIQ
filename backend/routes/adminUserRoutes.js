const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/', adminUserController.listUsers);

module.exports = router;


