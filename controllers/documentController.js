// const Data = require('../models/dataModel');
// const upload = require('../middlewares/uploadMiddleware');
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
// const Document = require('../models/docModel');
// const fs = require('fs');
// const path = require('path');

// exports.addDocument = async (req, res) => {
//     console.log("Start your upload function");
//     upload.array('files', 10)(req, res, async (err) => { // 'files' should be a string
//         if (err) {
//             console.log(err);
//             return res.status(400).json({ message: err.message });
//         }

//         try {
//             const token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decoded.id);

//             // Generate URLs for the uploaded files
//             const filesPaths = req.files.map(file => {
//                 return `${req.protocol}://${req.get('host')}/uploads/${user._id}/${file.filename}`;
//             });

//             const { title, uploadDate, author } = req.body;

//             const newDocument = new Document({
//                 title, uploadDate, author, files: filesPaths, userId: user._id
//             });
//             await newDocument.save();
//             console.log("Data added successfully");
//             res.status(200).json({ message: "Data added" });
//         } catch (error) {
//             console.log(error);
//             res.status(500).json({ message: "Server error" });
//         }
//     });
// };

// exports.getDocById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = await Document.findById(id);
//         if (!data) {
//             console.log("Document not found for Id", id);
//             return res.status(404).json({ message: "Document not found" });
//         }
//         res.status(200).json(data);
//     } catch (error) {
//         console.log("Error fetching document by ID", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.updateDoc = async (req, res) => {
//     console.log('Start the update function');
//     upload.array('files', 10)(req, res, async (err) => {
//         if (err) {
//             console.log(err);
//             return res.status(400).json({ message: err.message });
//         }

//         const { title, uploadDate, author, id } = req.body;
//         if (!id) {
//             return res.status(400).json({ message: 'Document ID required' });
//         }

//         try {
//             const token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decoded.id);

//             const data = await Data.findById(id);
//             if (!data) {
//                 return res.status(404).json({ message: 'Data not found' });
//             }

//             if (user.role !== "admin" && user._id.toString() !== data.userId.toString()) {
//                 return res.status(403).json({ message: "You don't have permission to update this data" });
//             }

//             let filesPaths = data.files;
//             if (req.files && req.files.length > 0) {
//                 filesPaths = req.files.map(file => {
//                     return `${req.protocol}://${req.get('host')}/uploads/${user._id}/${file.filename}`;
//                 });
//             }

//             const updateDoc = await Data.findByIdAndUpdate(
//                 id,
//                 { title, uploadDate, author, files: filesPaths }, // Changed imagesVideos to files
//                 { new: true }
//             );

//             console.log("Updated successfully");
//             res.status(200).json({ message: "Data updated successfully", data: updateDoc });
//         } catch (error) {
//             console.log(error);
//             res.status(500).json({ message: "Server error" });
//         }
//     });
// };

// exports.getDoc = async (req, res) => {
//     try {
//         const data = await Data.find();
//         let dataToSend = [];

//         data.forEach(item => {
//             dataToSend.push({
//                 id: item._id,
//                 title: item.title,
//                 uploadDate: new Date(item.uploadDate).toLocaleDateString('fr-FR'),
//                 author: item.author
//             });
//         });
//         res.status(200).json(dataToSend);
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// exports.deleteDoc = async (req, res) => { // Fixed order of req, res
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);

//         const { id } = req.body;
//         if (!id) {
//             return res.status(400).json({ message: 'ID is required' });
//         }

//         const data = await Data.findById(id);
//         if (!data) {
//             return res.status(400).json({ message: 'Data not found' });
//         }

//         if (user.role === "admin" || user._id.toString() === data.userId.toString()) {
//             if (data.files && Array.isArray(data.files)) {
//                 data.files.forEach((fileUrl) => {
//                     const filePath = path.join(__dirname, '..', 'uploads', fileUrl.split('/uploads/')[1]);
//                     fs.unlink(filePath, (err) => {
//                         if (err) {
//                             console.error(`Error deleting file: ${filePath}`, err);
//                         } else {
//                             console.log(`Deleted file: ${filePath}`);
//                         }
//                     });
//                 });
//             }

//             await Data.findByIdAndDelete(id);
//             console.log("Data deleted!");
//             return res.status(200).json({ message: 'Data deleted successfully' });
//         } else {
//             res.status(403).json({ message: "You don't have the permission!" });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.getOneDoc = async (req, res) => {
//     try {
//         const itemId = req.query.itemId;
//         const data = await Data.findOne({ _id: itemId });
//         let dataToSend = {
//             id: data._id,
//             title: data.title,
//             author: data.author,
//             uploadDate: new Date(data.uploadDate).toLocaleDateString('fr-FR'),
//             files: convertUrlsToMediaObjects(data.files)
//         };
//         res.status(200).json(dataToSend);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

// // Helper function to classify file types
// const convertUrlsToMediaObjects = (urls) => {
//     return urls.map(url => {
//         const extension = url.split('.').pop();
//         let type;

//         // Check file extensions for PDF, Word, or images
//         if (['pdf'].includes(extension)) {
//             type = 'pdf';
//         } else if (['doc', 'docx'].includes(extension)) {
//             type = 'word';
//         } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
//             type = 'image';
//         } else {
//             type = 'unknown';
//         }

//         return { type, url };
//     });
// };


// controllers/FileUploadController.js
const Document = require('../models/Document');
const fs = require('fs').promises;
const path = require('path');

const documentController = {
    uploadDocuments: async (req, res) => {
        try {
            const { title, description } = req.body;
            const files = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));

            const document = new Document({
                title,
                description,
                files,
                uploadedBy: req.user.id // This comes from your auth middleware
            });

            await document.save();

            res.status(201).json({
                success: true,
                document
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading documents',
                error: error.message
            });
        }
    },

    getAllDocuments: async (req, res) => {
        try {
            const documents = await Document.find({ uploadedBy: req.user.id })
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching documents',
                error: error.message
            });
        }
    },

    getDocument: async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.id,
                uploadedBy: req.user.id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.json({
                success: true,
                document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching document',
                error: error.message
            });
        }
    },

    downloadFile: async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.documentId,
                uploadedBy: req.user.id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            const file = document.files.find(f => f._id.toString() === req.params.fileId);
            if (!file) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }

            res.download(file.path, file.originalName);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error downloading file',
                error: error.message
            });
        }
    },

    deleteDocument: async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.id,
                uploadedBy: req.user.id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            // Delete associated files
            for (const file of document.files) {
                try {
                    await fs.unlink(file.path);
                } catch (error) {
                    console.error(`Error deleting file ${file.path}:`, error);
                }
            }

            await document.deleteOne();

            res.json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting document',
                error: error.message
            });
        }
    }
};

module.exports = documentController;