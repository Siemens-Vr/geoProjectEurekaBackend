const express = require('express');
const { addData, getData, deleteData } = require('../controllers/dataController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addData);
router.get('/all', protect, getData);
router.delete('/delete', protect, deleteData);

module.exports = router;
