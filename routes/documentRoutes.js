// const express = require('express');
// const {
//     addDocument,
//     getDocById,
//     updateDoc,
//     getDoc,
//     deleteDoc,
//     getOneDoc
// } = require('../controllers/docController');
// const { protect } = require('../middlewares/authMiddleware');
// const router = express.Router();

// // Document routes
// router.post('/addDoc', protect, addDocument);               // Add a new document
// router.get('/docById/:id', protect, getDocById);            // Get a document by ID
// router.put('/updateDoc', protect, updateDoc);               // Update a document
// router.get('/getDocs', protect, getDoc);                    // Get all documents for a logged-in user
// router.delete('/deleteDoc', protect, deleteDoc);            // Delete a document
// router.get('/getOneDoc', protect, getOneDoc);               // Get a single document with specific details

// module.exports = router;

// routes/fileUploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Update path as needed

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const { 
    uploadDocuments, 
    getAllDocuments, 
    getDocument, 
    downloadFile, 
    deleteDocument 
} = require('../controllers/documentController');

// Protected routes
router.post('/upload', authenticateToken, upload.array('files'), uploadDocuments);
router.get('/', authenticateToken, getAllDocuments);
router.get('/:id', authenticateToken, getDocument);
router.get('/download/:documentId/:fileId', authenticateToken, downloadFile);
router.delete('/:id', authenticateToken, deleteDocument);

module.exports = router;