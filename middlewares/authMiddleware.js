const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const bearerToken = req.header('Authorization')
    const token = bearerToken ? bearerToken.replace('Bearer ', '') : null;
    if (!token) {
        console.log('No token, authorization denied')
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token is not valid')
        
        res.status(401).json({ error: 'Token is not valid' });
    }
};
