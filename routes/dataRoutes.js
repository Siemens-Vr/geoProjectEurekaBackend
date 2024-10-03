const express = require('express');
const { addData, getData, deleteData, updateData, getDataById } = require('../controllers/dataController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addData);
router.get('/all', protect, getData);
router.get('/:id', protect, getDataById)
router.delete('/delete', protect, deleteData);
router.put('/update/:id', protect, updateData);

module.exports = router;
