const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
    const bearerToken = req.header('Authorization')
    const token = bearerToken ? bearerToken.replace('Bearer ', '') : null;
    
    if (!token) {
        console.log('No token, authorization denied')
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'User not found' });
        }


        next();
    } catch (error) {
        console.log('Token is not valid')
        res.status(401).json({ error: 'Token is not valid' });
    }
};
