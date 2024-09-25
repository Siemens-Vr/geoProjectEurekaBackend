const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(402).json({ message: 'No refresh token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        req.user = decoded;

        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'User not found' });
        }
        
        const token = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET,{ expiresIn: '1h' });
        console.log("Token refresh")
        res.json({ token });
    } catch (error) {
        res.status(401).json({ message: 'Refresh token is not valid' });
    }
};

