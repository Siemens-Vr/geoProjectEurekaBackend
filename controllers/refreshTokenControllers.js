const jwt = require('jsonwebtoken');

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(402).json({ message: 'No refresh token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const token = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET,{ expiresIn: '1h' });
        console.log("Token refresh")
        res.json({ token });
    } catch (error) {
        res.status(401).json({ message: 'Refresh token is not valid' });
    }
};

