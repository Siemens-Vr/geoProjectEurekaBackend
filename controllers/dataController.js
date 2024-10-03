const Data = require('../models/dataModel');
const upload = require('../middlewares/uploadMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// Add data (protected route)
exports.addData = async (req, res) => {
    console.log("start upload function");
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ message: err.message });
        }


        try {
            // Decode token to get the user
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            const user = await User.findById(decoded.id); 


            // Generate URLs from the files
            const filesPaths = req.files.map(file => {
                return `${req.protocol}://${req.get('host')}/uploads/${user._id}/${file.filename}`;
            });


             // Get datas from req.body
             const {
                title, location, sampleType, collectionDate, depth, temperature, pH, 
                electricalConductivity, geochemistryComment, lithology, alteration,
                mineralogy, geochimicalAnalysis, texture, hydrothermalFeatures, structure,
                geologyComment, method, surveyDate, depthOfPenetrationMeters, resolutionsMeters,
                measuredParameters, recoveredPropertiesOfInterest, instrumentUsed, potentialTargets,
                geophysicsComment
            } = req.body;

            // save datas in MongoDB
            const newData = new Data({
                title,
                location,
                sampleType,
                collectionDate,
                depth,
                temperature,
                pH,
                electricalConductivity,
                geochemistryComment,
                lithology,
                alteration,
                mineralogy,
                geochimicalAnalysis,
                texture,
                hydrothermalFeatures,
                structure,
                geologyComment,
                method,
                surveyDate,
                depthOfPenetrationMeters,
                resolutionsMeters,
                measuredParameters,
                recoveredPropertiesOfInterest,
                instrumentUsed,
                potentialTargets,
                geophysicsComment,
                imagesVideos: filesPaths,
                userId: user._id,
                author: `${user.firstName} ${user.lastName}`
            });
            await newData.save();
            console.log("Datas added !!")
            res.status(201).json({ message: 'Datas added' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.getDataById = async (req, res) => {
    console.log('Fetching data for ID:', req.params.id); // Debug log
    try {
        const { id } = req.params;
        const data = await Data.findById(id);
        if (!data) {
            console.log('Data not found for ID:', id);
            return res.status(404).json({ message: 'Data not found' });
        }
        console.log('Data found:', data);
        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching data by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// update data (protected route)
exports.updateData = async (req, res) => {
    const { id } = req.params;  // Correcting the typo
    console.log("Received ID:", id);
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Correctly verify token
        const user = await User.findById(decoded.id);  // Assuming the token decodes `id`, not `_id`

        // Find the data using the provided ObjectId
        const data = await Data.findOne({ _id: id });
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }

        // Check if the user is either an admin or the owner of the data
        if (user.role !== "admin" && user._id.toString() !== data.userId.toString()) {
            return res.status(403).json({ message: 'You don\'t have permission' });
        }

        // Update the data and return the updated result
        const updateData = await Data.findOneAndUpdate({ _id: id }, req.body, { new: true });
        res.status(200).json({ message: 'Data updated successfully', data: updateData });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all data for a logged-in user
exports.getData = async (req, res) => {
    try {
        const data = await Data.find();
        let dataToSend =[];
        
        data.forEach(item => {
            dataToSend.push({
                id: item._id,
                title: item.title,
                date: new Date(item.collectionDate).toLocaleDateString('fr-FR'),
                autor: item.author,
                medias: convertUrlsToMediaObjects(item.imagesVideos),
                geology: item.geologyComment,
                geochemistry: item.geochemistryComment,
                geophysics: item.geophysicsComment,
                userId: item.userId,
                datas:{
                    location: item.location,
                    sampleType: item.sampleType,
                    depth: item.depth,
                    temperature: item.temperature,
                    pH: item.pH,
                    electricalConductivity: item.electricalConductivity,
                    lithology: item.lithology,
                    alteration: item.alteration,
                    mineralogy: item.mineralogy,
                    geochimicalAnalysis: item.geochimicalAnalysis,
                    texture: item.texture,
                    hydrothermalFeatures: item.hydrothermalFeatures,
                    structure: item.structure,
                    method: item.method,
                    surveyDate: item.surveyDate? new Date(item.surveyDate).toLocaleDateString('fr-FR'):null,
                    depthOfPenetrationMeters: item.depthOfPenetrationMeters,
                    resolutionsMeters: item.resolutionsMeters,
                    measuredParameters: item.measuredParameters,
                    recoveredPropertiesOfInterest: item.recoveredPropertiesOfInterest,
                    instrumentUsed: item.instrumentUsed,
                    potentialTargets: item.potentialTargets
                }
            })
        });
        res.status(200).json(dataToSend);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete data
exports.deleteData = async (req, res) => {
    try {
        // Decode token to get the user
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await User.findById(decoded.id); 
        
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const data = await Data.findOne({ dataId: id });
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }

       if (user.role === "admin" || user._id.toString() === data.userId.toString()) {
            if (data.imagesVideos && Array.isArray(data.imagesVideos)) {
                data.imagesVideos.forEach((fileUrl) => {
                    const filePath = path.join(__dirname, '..', 'uploads', fileUrl.split('/uploads/')[1]);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${filePath}`, err);
                        } else {
                            console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });
            }
        
        
            await Data.findOneAndDelete({ dataId: id });
            console.log("data deleted!");
            return res.status(200).json({ message: 'Data deleted successfully' });
        } else {
            res.status(403).json({ message: `You don't have the permission !` })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const convertUrlsToMediaObjects = (urls) => {
    return urls.map(url => {
        const extension = url.split('.').pop();
        // check etension
        let type;
        if (['mp4', 'avi', 'mov'].includes(extension)) {
            type = 'video';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            type = 'image';
        } else {
            type = 'unknown';
        }
        return {
            type,
            url
        };
    });
};
