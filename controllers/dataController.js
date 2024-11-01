const Data = require('../models/dataModel');
const upload = require('../middlewares/uploadMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Document= require('../models/docModel');
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
            res.status(200).json({ message: 'Datas added' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Server error' });
        }
    });
};

exports.getDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Data.findById(id);
        if (!data) {
            console.log('Data not found for ID:', id);
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching data by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// update data (protected route)
exports.updateData = async (req, res) => {
    console.log("Start update function");
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ message: err.message });
        }

        const {
            title, location, sampleType, collectionDate, depth, temperature, pH,
            electricalConductivity, geochemistryComment, lithology, alteration,
            mineralogy, geochimicalAnalysis, texture, hydrothermalFeatures, structure,
            geologyComment, method, surveyDate, depthOfPenetrationMeters, resolutionsMeters,
            measuredParameters, recoveredPropertiesOfInterest, instrumentUsed, potentialTargets,
            geophysicsComment, dataId,id
        } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Data ID is required' });
        }

        try {
            // Decode token to get the user
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            // Find the existing data entry
            const data = await Data.findById(id); 
            if (!data) {
                return res.status(404).json({ message: 'Data not found' });
            }

            // Check if the user is either an admin or the owner of the data
            if (user.role !== "admin" && user._id.toString() !== data.userId.toString()) {
                return res.status(403).json({ message: 'You don\'t have permission to update this data' });
            }

            // If new files are uploaded, update the imagesVideos field
            let filesPaths = data.imagesVideos;
            if (req.files && req.files.length > 0) {
                filesPaths = req.files.map(file => {
                    return `${req.protocol}://${req.get('host')}/uploads/${user._id}/${file.filename}`;
                });
            }

            // Update the data fields
            const updatedData = await Data.findByIdAndUpdate(
                id,
                {
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
                },
                { new: true } // Return the updated document
            );

            console.log("Data updated successfully");
            res.status(200).json({ message: 'Data updated successfully', data: updatedData });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Server error' });
        }
    });
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
        console.log(id)
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const data = await Data.findById(id);
        if (!data) {
            return res.status(400).json({ message: 'Data not found' });
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
        
        
            await Data.findByIdAndDelete(id);
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

exports.getOneProject = async (req, res) => {
    try {
        const itemId = req.query.itemId
        const data = await Data.findOne({_id: itemId});
        let dataToSend
        
        dataToSend = {
                id: data.dataId,
                title: data.title,
                date: new Date(data.collectionDate).toLocaleDateString('fr-FR'),
                autor: data.author,
                medias: convertUrlsToMediaObjects(data.imagesVideos),
                geology: data.geologyComment,
                geochemistry: data.geochemistryComment,
                geophysics: data.geophysicsComment,
                userId: data.userId,
                datas:{
                    location: data.location,
                    sampleType: data.sampleType,
                    depth: data.depth,
                    temperature: data.temperature,
                    pH: data.pH,
                    electricalConductivity: data.electricalConductivity,
                    lithology: data.lithology,
                    alteration: data.alteration,
                    mineralogy: data.mineralogy,
                    geochimicalAnalysis: data.geochimicalAnalysis,
                    texture: data.texture,
                    hydrothermalFeatures: data.hydrothermalFeatures,
                    structure: data.structure,
                    method: data.method,
                    surveyDate: data.surveyDate? new Date(data.surveyDate).toLocaleDateString('fr-FR'):null,
                    depthOfPenetrationMeters: data.depthOfPenetrationMeters,
                    resolutionsMeters: data.resolutionsMeters,
                    measuredParameters: data.measuredParameters,
                    recoveredPropertiesOfInterest: data.recoveredPropertiesOfInterest,
                    instrumentUsed: data.instrumentUsed,
                    potentialTargets: data.potentialTargets
                }
            }
        res.status(200).json(dataToSend);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const convertUrlsToMediaObjects = (urls) => {
    return urls.map(url => {
        const extension = url.split('.').pop();
        // check etension
        let type;
        if (['mp4', 'avi', 'mov', 'mkv'].includes(extension)) {
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
