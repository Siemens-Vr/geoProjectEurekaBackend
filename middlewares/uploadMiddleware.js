const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 


const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        console.log("Authorization header missing");
        return cb(new Error('Authorization header missing'), false);
      }

      const token = authorizationHeader.split(' ')[1]; // Get the token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token with the private key
      const user = await User.findById(decoded.id); // Get the user with the ID from the token
      
      
      
      if (!user) {
        console.log("User ID not found in database:", decoded.id);
        return cb(new Error('User not found'), false);
      }

      const userFolder = `uploads/${user._id}`; // Create the destination with the user ID

      // Verify if the folder exist if not create
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      cb(null, userFolder);
    } catch (error) {
      console.log("Error in destination:", error);
      cb(new Error('Error destination'), false); // error, return a error message
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname); // Keep the original extension
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// Filter files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and MP4 are allowed.'), false);
  }
};

// Limit
const limits = {
  fileSize: 1024 * 1024 * 1024 * 2, // Limit of size : 2 Go
};

// Config multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;
