const express = require('express');
const { register, login, role, deleteAccount, updateAccount } = require('../controllers/authController');
const {refresh} = require('../controllers/refreshTokenControllers')
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.delete('/delete', protect,deleteAccount);
router.put('/update', protect, updateAccount);
router.post('/refresh', refresh);
router.get('/role', role);

module.exports = router;
