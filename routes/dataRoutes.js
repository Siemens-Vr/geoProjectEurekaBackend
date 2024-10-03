const express = require('express');
const { addData, getData, deleteData, updateData, getDataById, getOneProject } = require('../controllers/dataController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addData);
router.get('/all', protect, getData);
router.get('/:id', protect, getDataById)
router.delete('/delete', protect, deleteData);
router.get('/project', protect, getOneProject);
router.put('/update', protect, updateData);

module.exports = router;
