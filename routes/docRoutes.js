const express = require('express');
const {
    addDocument,
    getDocById,
    updateDoc,
    getDoc,
    deleteDoc,
    getOneDoc
} = require('../controllers/docController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Document routes
router.post('/addDoc', protect, addDocument);               // Add a new document
router.get('/docById/:id', protect, getDocById);            // Get a document by ID
router.put('/updateDoc', protect, updateDoc);               // Update a document
router.get('/getDocs', protect, getDoc);                    // Get all documents for a logged-in user
router.delete('/deleteDoc', protect, deleteDoc);            // Delete a document
router.get('/getOneDoc', protect, getOneDoc);               // Get a single document with specific details

module.exports = router;
