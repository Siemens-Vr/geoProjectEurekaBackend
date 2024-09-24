const express = require('express');
const { register, login, role } = require('../controllers/authController');
const {refresh} = require('../controllers/refreshTokenControllers')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/role', role);

module.exports = router;
